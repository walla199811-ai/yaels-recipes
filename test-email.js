const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testEmail() {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // This will use your App Password from .env.local
      },
    });

    console.log('🔧 Testing email connection...');

    const info = await transporter.sendMail({
      from: '"Yael\'s Recipes Test" <recipesyael@gmail.com>',
      to: 'walla199811@gmail.com',
      subject: 'בדיקת חיבור אימייל - Email Connection Test',
      text: 'זה מייל בדיקה מהמערכת של יעל.\n\nThis is a test email from Yael\'s system.',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif;">
          <h2>🍳 בדיקת חיבור אימייל</h2>
          <p>זה מייל בדיקה מהמערכת של יעל.</p>
          <p><strong>אם אתה רואה את המייל הזה - החיבור עובד!</strong></p>
          <hr>
          <p dir="ltr"><em>This is a test email from Yael's system.</em></p>
          <p dir="ltr"><strong>If you see this email - the connection works!</strong></p>
        </div>
      `
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('📧 Check your inbox at walla199811@gmail.com');

  } catch (error) {
    console.error('❌ Email test failed:');
    console.error(error.message);

    if (error.code === 'EAUTH') {
      console.log('\n🔐 Authentication Error Solutions:');
      console.log('1. Enable 2-Factor Authentication on Gmail');
      console.log('2. Generate an App Password (not your regular password)');
      console.log('3. Use the 16-character App Password in EMAIL_PASS');
      console.log('4. Visit: https://myaccount.google.com/apppasswords');
    }
  }
}

testEmail();