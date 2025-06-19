# Avatar Upload Setup

## Environment Variables Required

Add the following environment variables to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## How to Use

### Frontend Implementation

1. Create a file input in your form:
```html
<input type="file" name="avatar" accept="image/*" />
```

2. Send the form data using `FormData`:
```javascript
const formData = new FormData();
formData.append('username', username);
formData.append('phone', phone);
formData.append('firstName', firstName);
formData.append('lastName', lastName);

// Add file if selected
if (avatarFile) {
  formData.append('avatar', avatarFile);
}

// Send request
const response = await fetch('/api/v1/users/update-profile', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData
});
```

### API Endpoint

**POST** `/api/v1/users/update-profile`

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Body (FormData):**
- `username` (optional): string
- `phone` (optional): string (9-11 digits)
- `firstName` (optional): string
- `lastName` (optional): string
- `avatar` (optional): image file (jpg, jpeg, png, gif)

**Response:**
```json
{
  "message": "Update profile successfully",
  "isSuccess": true,
  "user": {
    "_id": "...",
    "username": "...",
    "email": "...",
    "firstName": "...",
    "lastName": "...",
    "phone": "...",
    "avatar": "https://res.cloudinary.com/...",
    "role": "...",
    "status": "...",
    "assignedWarehouse": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

## Features

- ✅ Image upload to Cloudinary
- ✅ Automatic image resizing (500x500)
- ✅ Old avatar deletion when new one is uploaded
- ✅ Support for jpg, jpeg, png, gif formats
- ✅ Images stored in 'warehouse-avatars' folder
- ✅ Error handling for upload failures

## Dependencies Added

- `multer`: For handling multipart/form-data
- `cloudinary`: Cloudinary SDK
- `multer-storage-cloudinary`: Multer storage engine for Cloudinary 