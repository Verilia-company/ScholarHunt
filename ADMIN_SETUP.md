# Admin Setup Documentation

## Admin Access

The admin system is configured with role-based access control using Firebase Authentication and Firestore.

### Designated Admin

- **Email**: `mutaawe38@gmail.com`
- **Auto-promotion**: This email is automatically assigned admin role upon first login

### Admin Features

- **User Management**: Promote/demote users to admin role
- **Scholarship Management**: Add, edit, delete scholarships
- **Blog Management**: Create, edit, delete blog posts
- **Settings**: Configure site settings

### Accessing Admin Dashboard

1. Sign in with Google using `mutaawe38@gmail.com`
2. Navigate to `/admin`
3. Access the "Users" tab to manage other users' roles

### Security Features

- Role-based access control
- Firestore integration for user profiles
- Real-time auth state management
- Automatic user profile creation
- Protected admin routes

### User Role Management

Admins can promote other users to admin status through the admin dashboard:

1. Go to Admin Dashboard → Users tab
2. Find the user you want to promote
3. Click "Promote" button
4. User will have admin access on next login

### Technical Notes

- User roles are stored in Firestore (`users` collection)
- Admin status is verified on every protected route access
- Firebase Security Rules should be configured to protect user role updates
