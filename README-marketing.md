# Marketing Module Documentation

## Overview

The Marketing Module in Renograte provides a comprehensive system for managing marketing campaigns and assets. It's designed for administrators to create, organize, and distribute marketing materials to members and agents.

## Features

### Admin Features

- **Campaign Management**: Create, edit, archive, and delete marketing campaigns
- **Asset Management**: Upload, categorize, and organize marketing materials
- **Asset Types Support**: Images, videos, documents, email templates, social posts, presentations
- **Campaign-Asset Association**: Link marketing assets to specific campaigns
- **Dashboard Overview**: View key metrics and recent items

### Member Features

- **Asset Library**: Browse and download marketing materials
- **Campaign Access**: View active campaigns and associated materials
- **Filtering and Search**: Find assets by type, category, or keyword

## Architecture

### Database Models

#### MarketingAsset
- `id`: Unique identifier
- `title`: Asset title
- `description`: Optional description
- `type`: Asset type (image, video, document, email_template, social_post, presentation)
- `category`: Category for organization
- `url`: URL to the stored asset
- `thumbnail`: Optional thumbnail URL
- `fileSize`: Size of the file in bytes
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

#### Campaign
- `id`: Unique identifier
- `title`: Campaign title
- `description`: Optional campaign description
- `status`: Status (draft, active, archived)
- `startDate`: Optional campaign start date
- `endDate`: Optional campaign end date
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

#### CampaignAsset (Junction Table)
- `id`: Unique identifier
- `campaignId`: Reference to Campaign
- `assetId`: Reference to MarketingAsset
- `createdAt`: Creation timestamp

### API Endpoints

#### Campaigns
- `GET /api/marketing/campaigns`: List all campaigns
- `GET /api/marketing/campaigns/:id`: Get a specific campaign
- `POST /api/marketing/campaigns`: Create a new campaign
- `PATCH /api/marketing/campaigns/:id`: Update a campaign
- `DELETE /api/marketing/campaigns/:id`: Delete a campaign

#### Assets
- `GET /api/marketing/assets`: List all assets
- `GET /api/marketing/assets/:id`: Get a specific asset
- `POST /api/marketing/assets`: Upload a new asset
- `PATCH /api/marketing/assets/:id`: Update an asset
- `DELETE /api/marketing/assets/:id`: Delete an asset

### UI Components

#### Admin Dashboard
- `/admin/marketing`: Marketing overview dashboard
- `/admin/marketing/campaigns`: Campaign management
- `/admin/marketing/campaigns/new`: Create new campaign
- `/admin/marketing/campaigns/:id`: View campaign details
- `/admin/marketing/campaigns/:id/edit`: Edit campaign
- `/admin/marketing/assets`: Asset management
- `/admin/marketing/assets/new`: Upload new asset
- `/admin/marketing/assets/:id`: View asset details
- `/admin/marketing/assets/:id/edit`: Edit asset

#### Member Access
- `/marketing`: Marketing materials overview
- `/marketing/campaigns`: Browse campaigns
- `/marketing/campaigns/:id`: View campaign details
- `/marketing/assets`: Browse assets

## Implementation Details

### Asset Storage

Marketing assets are stored in a cloud storage service with the following workflow:
1. User uploads file through the UI
2. File is processed on the server
3. File is stored in cloud storage
4. URL and metadata are saved to the database

### Access Control

- **Admin Role**: Full access to create, edit, and delete campaigns and assets
- **Member/Agent Role**: Read-only access to active campaigns and assets
- **Public**: No access to marketing materials

### Asset Preview

- **Images**: Direct preview in the browser
- **Videos**: Video player for supported formats
- **Documents**: Download to view
- **Email Templates**: HTML preview
- **Social Posts**: Formatted preview
- **Presentations**: Download to view

## Usage

### Creating a Campaign

1. Navigate to `/admin/marketing/campaigns/new`
2. Fill in campaign details (title, description, dates, status)
3. Select assets to include in the campaign
4. Save the campaign

### Uploading Assets

1. Navigate to `/admin/marketing/assets/new`
2. Fill in asset details (title, description, type, category)
3. Upload the file (max size: 10MB)
4. Save the asset

### Managing Campaigns

1. Navigate to `/admin/marketing/campaigns`
2. Use filters to find specific campaigns
3. Click on a campaign to view details
4. Use action buttons to edit, archive, or delete

### Managing Assets

1. Navigate to `/admin/marketing/assets`
2. Use filters to find specific assets by type or category
3. Toggle between grid and list views
4. Click on an asset to view details
5. Use action buttons to edit or delete

## Future Enhancements

- **Analytics**: Track asset downloads and usage
- **Scheduling**: Schedule campaign publication and expiration
- **Templates**: Create reusable campaign templates
- **Bulk Operations**: Upload and manage multiple assets at once
- **Advanced Filtering**: More sophisticated search and filtering options
- **Notifications**: Alert members about new campaigns and assets
- **Permissions**: Granular access controls for different user roles
- **Versioning**: Track asset versions and updates 