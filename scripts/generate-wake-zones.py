#!/usr/bin/env python3
"""Generate shoreline-distance bands for the wake-awareness map.

The lake outlines are WGS84. Coordinates are projected to a local metre grid,
processed with the repository machine's GEOS command-line tool, then converted
back to WGS84. The browser receives finished polygons and does not need a
geospatial runtime dependency.
"""

import json
import math
import subprocess
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/map-data/our-lakes.geojson"
OUTPUT = ROOT / "public/map-data/wake-zones.geojson"
EARTH_RADIUS_M = 6_378_137
ORIGIN_LON = -78.55
ORIGIN_LAT = 45.19
COS_ORIGIN_LAT = math.cos(math.radians(ORIGIN_LAT))


def map_coordinates(value, converter):
    if value and isinstance(value[0], (int, float)):
        return list(converter(value[0], value[1]))
    return [map_coordinates(item, converter) for item in value]


def to_local(lon, lat):
    return (
        math.radians(lon - ORIGIN_LON) * EARTH_RADIUS_M * COS_ORIGIN_LAT,
        math.radians(lat - ORIGIN_LAT) * EARTH_RADIUS_M,
    )


def to_wgs84(x, y):
    return (
        ORIGIN_LON + math.degrees(x / (EARTH_RADIUS_M * COS_ORIGIN_LAT)),
        ORIGIN_LAT + math.degrees(y / EARTH_RADIUS_M),
    )


def geometry_to_wkt(geometry):
    def ring_to_wkt(ring):
        return "(" + ",".join(f"{x:.6f} {y:.6f}" for x, y in ring) + ")"

    if geometry["type"] == "Polygon":
        return "POLYGON (" + ",".join(ring_to_wkt(ring) for ring in geometry["coordinates"]) + ")"
    if geometry["type"] == "MultiPolygon":
        polygons = []
        for polygon in geometry["coordinates"]:
            polygons.append("(" + ",".join(ring_to_wkt(ring) for ring in polygon) + ")")
        return "MULTIPOLYGON (" + ",".join(polygons) + ")"
    if geometry["type"] == "GeometryCollection" and not geometry.get("geometries"):
        return "GEOMETRYCOLLECTION EMPTY"
    raise ValueError(f"Unsupported geometry type: {geometry['type']}")


def geos_operation(geometry_a, operation, argument=None, geometry_b=None):
    with tempfile.TemporaryDirectory(prefix="wake-zones-") as temp_dir:
        temp = Path(temp_dir)
        path_a = temp / "a.wkt"
        path_a.write_text(geometry_to_wkt(geometry_a) + "\n")
        command = ["/opt/homebrew/bin/geosop", "-a", str(path_a)]
        if geometry_b is not None:
            path_b = temp / "b.wkt"
            path_b.write_text(geometry_to_wkt(geometry_b) + "\n")
            command += ["-b", str(path_b)]
        command += ["-f", "geojson", operation]
        if argument is not None:
            command.append(argument)
        result = subprocess.run(command, capture_output=True, text=True)
        if result.returncode:
            details = result.stderr.strip() or result.stdout.strip()
            raise RuntimeError(details or f"GEOS operation failed: {operation}")
        return json.loads(result.stdout)


def is_empty(geometry):
    if geometry.get("type") == "GeometryCollection":
        return not geometry.get("geometries")

    def has_position(value):
        if isinstance(value, (list, tuple)):
            if len(value) >= 2 and isinstance(value[0], (int, float)) and isinstance(value[1], (int, float)):
                return True
            return any(has_position(item) for item in value)
        return False

    return not has_position(geometry.get("coordinates"))


def main():
    source = json.loads(SOURCE.read_text())
    features = []

    for part_index, feature in enumerate(source["features"]):
        lake = feature["properties"]["NAME"]
        local_geometry = {
            "type": feature["geometry"]["type"],
            "coordinates": map_coordinates(feature["geometry"]["coordinates"], to_local),
        }
        inside_30 = geos_operation(local_geometry, "buffer", "N-30")
        inside_200 = geos_operation(local_geometry, "buffer", "N-200")
        inside_300 = geos_operation(local_geometry, "buffer", "N-300")
        no_wake = (
            local_geometry
            if is_empty(inside_30)
            else geos_operation(local_geometry, "differenceSR", "1000", inside_30)
        )
        try:
            no_sports = (
                inside_30
                if not is_empty(inside_30) and is_empty(inside_200)
                else geos_operation(inside_30, "difference", geometry_b=inside_200)
                if not is_empty(inside_30)
                else {"type": "GeometryCollection", "geometries": []}
            )
            transit = (
                inside_200
                if not is_empty(inside_200) and is_empty(inside_300)
                else geos_operation(inside_200, "difference", geometry_b=inside_300)
                if not is_empty(inside_200)
                else {"type": "GeometryCollection", "geometries": []}
            )
        except RuntimeError as error:
            raise RuntimeError(
                f"{lake} part {part_index}: 30 m {inside_30.get('type')}, "
                f"200 m {inside_200.get('type')}, 300 m {inside_300.get('type')}"
            ) from error

        bands = [
            ("no-wake", "0–30 m · legal speed zone", 0, 30, no_wake),
            ("no-sports", "30–200 m · not suitable for water sports", 30, 200, no_sports),
            ("transit", "200–300 m · well-trimmed planing transit", 200, 300, transit),
            ("water-sports", "300m+ · acceptable water-sports zone", 300, None, inside_300),
        ]
        for zone, label, min_m, max_m, local_band in bands:
            if is_empty(local_band):
                continue
            wgs84_band = dict(local_band)
            wgs84_band["coordinates"] = map_coordinates(local_band["coordinates"], to_wgs84)
            features.append(
                {
                    "type": "Feature",
                    "properties": {
                        "lake": lake,
                        "lake_part": part_index,
                        "zone": zone,
                        "label": label,
                        "min_m": min_m,
                        "max_m": max_m,
                    },
                    "geometry": wgs84_band,
                }
            )

    OUTPUT.write_text(
        json.dumps(
            {
                "type": "FeatureCollection",
                "name": "Redstone area lake wake-awareness zones",
                "features": features,
            },
            separators=(",", ":"),
        )
        + "\n"
    )
    print(f"Wrote {len(features)} zone features to {OUTPUT}")


if __name__ == "__main__":
    main()
