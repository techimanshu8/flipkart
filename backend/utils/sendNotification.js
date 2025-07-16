const admin = require('firebase-admin');
const User = require('../models/User');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

/**
 * Send push notification to user
 * @param {Object} options
 * @param {string} options.userId - User ID to send notification to
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 * @param {string} options.type - Notification type (e.g., 'order_update', 'delivery_assignment')
 * @param {Object} options.data - Additional data to send with notification
 */
const sendNotification = async ({ userId, title, message, type, data = {} }) => {
  try {
    // Get user's FCM token
    const user = await User.findById(userId);
    if (!user || !user.fcmToken) {
      console.log('No FCM token found for user:', userId);
      return;
    }

    // Prepare notification
    const notification = {
      notification: {
        title,
        body: message,
      },
      data: {
        type,
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK', // For Flutter apps
      },
    };

    // Send to single device
    await admin.messaging().sendToDevice(user.fcmToken, notification);

    // Save notification to user's notifications array
    user.notifications.push({
      title,
      message,
      type,
      data,
      createdAt: new Date(),
    });
    await user.save();

    console.log('Notification sent successfully to user:', userId);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

module.exports = sendNotification;
