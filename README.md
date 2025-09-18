# BioProtect Engage – Data Collection App

## Overview

The BioProtect Engage app is part of the BioProtect Marine Planner system. It is designed to support stakeholder engagement and data collection in marine spatial planning. The app provides a simplified, browser-based interface that allows non-technical users to contribute features, activities, and local knowledge directly into conservation planning projects.

By making marine planning tools more accessible, BioProtect Engage helps ensure that both technical experts and community stakeholders can interact with data, add inputs, and see the effects of their contributions in near real time.

## Features

- Upload spatial data (e.g., shapefiles, GeoJSON) or draw features directly in the map interface.
- Add activities and pressures to planning grids, linked to the UK Marine Pressures and Activities database.
- Contribute local knowledge during stakeholder workshops without requiring technical expertise.
- See cumulative impact and scenario results displayed interactively on the map.
- Designed to integrate seamlessly with the BioProtect Marine Planner backend services.

## Installation

### Requirements

- Node.js (version 18 or above recommended)
- npm or yarn package manager
- > :memo: **Note:** The following is for development and testing purposes. For production deployment, the BioProtect Engage app should intereact with the main BioProtect Marine Planner backend services.
- Access to the BioProtect backend server (Tornado + PostGIS + Martin Tile Server)

## Steps

1.  Clone the repository:
    ```bash
    git clone https://gitlab.insight-centre.org/dai/bioprotect-data-collection-app.git
    cd bioprotect-data-collection-app
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables:

- Create a `.env` file in the project root and configure server endpoints, Mapbox/TileServer tokens, and other environment variables as required.

4. Run the development server:
   `npm start`

5. Build for production:  
   `npm run build`

## Usage

Once running, open the app in your browser. Users can:

- Log in to join a project session.
- Add features or activities to a planning grid.
- Explore how conservation scenarios change when new data is added.

The app is intended to be used in participatory workshops or planning sessions where planners and stakeholders work together on shared scenarios.

## Contributing

Contributions are welcome. Please:

- Fork the repository and create a feature branch.
- Submit merge requests with clear descriptions.
- Follow project coding standards (React 18 + MUI 5).

## Support

For issues, please use the Github issue tracker associated with this repository.

## License

This project is released under an open-source license (specify license here, e.g., MIT or GPL).

## Project Status

Active development. The app continues to evolve alongside the BioProtect Marine Planner project, with new features planned for stakeholder engagement and improved integration with backend services.
