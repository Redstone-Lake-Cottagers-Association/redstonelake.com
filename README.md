# Redstone Lake Cottagers Association Website

This is the official website for the Redstone Lake Cottagers Association (RLCA), built with [Next.js](https://nextjs.org/) and Bootstrap styling.

## About

The RLCA website provides cottagers and visitors with:
- Real-time water level monitoring from Parks Canada
- Weather information and radar
- Community news and updates
- Membership information
- New cottager guides
- Contact information and resources

## Reporting Issues & Requesting Updates

Website changes are managed by RLCA board members. To report issues or request updates, please email: **website@redstonelake.com**

## Contributing

This is an open source project - anyone can download the code and make changes! We welcome contributions from the community.

### How to Contribute

1. Fork this repository
2. Make your changes
3. Submit a Pull Request (PR)
4. Your PR will be reviewed by one of the site managers

### Contributor Agreement

By contributing to this project, you agree to the terms of the MIT License. Your contributed code becomes part of the project with no expectation of payment, rights, or warranty.

## Getting Started (Development)

First, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technology Stack

- **Framework**: Next.js 13
- **Styling**: Bootstrap (no Tailwind)
- **Backend**: Rails API (separate repository)
- **API Calls**: Fetch API
- **Deployment**: Fly.io

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── contact/        # Contact page
│   ├── membership/     # Membership information
│   ├── news/           # News and updates
│   └── water-quality/  # Water quality information
├── components/         # React components
│   ├── EnhancedWeatherWidget.tsx
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── LakeInfo.tsx
│   ├── LakeMap.tsx
│   ├── WaterLevelComponent.tsx
│   └── WeatherWidget.tsx
└── public/            # Static assets
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For website-related inquiries: website@redstonelake.com

For general RLCA information, visit our website or contact the association directly.