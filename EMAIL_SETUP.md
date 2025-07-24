# Email Configuration Guide

This guide explains how to set up email notifications for the Brigada Portal application using Mailjet.

## Overview

The application sends email notifications for:

- **Welcome emails** when new users register
- **Role assignment emails** when admins assign or change user roles

## Mailjet Setup

### 1. Create Mailjet Account

1. Go to [Mailjet.com](https://www.mailjet.com/)
2. Sign up for a free account (includes 6,000 emails/month)
3. Verify your email address

### 2. Get API Credentials

1. After logging in, go to **Account Settings** → **REST API** → **API Key Management**
2. Copy your **API Key** and **Secret Key**
3. Add them to your `.env` file:

```env
MAILJET_API_KEY="your-mailjet-api-key"
MAILJET_SECRET_KEY="your-mailjet-secret-key"
MAILJET_FROM_EMAIL="noreply@brigada.gov.az"
```

### 3. Domain Verification (Optional for Production)

For production environments, you may want to:

1. Add and verify your domain in Mailjet
2. Set up SPF/DKIM records for better deliverability
3. Update `MAILJET_FROM_EMAIL` to use your verified domain

## Environment Variables

| Variable             | Description                            | Required |
| -------------------- | -------------------------------------- | -------- |
| `MAILJET_API_KEY`    | Your Mailjet API key                   | Yes\*    |
| `MAILJET_SECRET_KEY` | Your Mailjet secret key                | Yes\*    |
| `MAILJET_FROM_EMAIL` | Sender email address                   | No\*\*   |
| `NEXTAUTH_URL`       | Your application URL (for email links) | Yes      |

\*If these are not set, the application will skip sending emails and log a warning.

\*\*Defaults to `noreply@brigada.gov.az` if not specified.

## Email Templates

### Welcome Email

- **Trigger**: When a new user registers
- **Content**: Welcome message explaining the approval process
- **Language**: Azerbaijani

### Role Assignment Email

- **Trigger**: When an admin assigns/changes user roles
- **Content**:
  - Notification of role changes
  - List of assigned roles
  - Link to portal (if roles assigned)
  - Administrator who made the change
- **Language**: Azerbaijani

## Testing Email Functionality

### Local Development

1. Set up Mailjet credentials in your `.env` file
2. Register a new user account
3. Check your email for the welcome message
4. As an admin, assign roles to the user
5. Check the user's email for the role assignment notification

### Production

1. Verify your domain with Mailjet for better deliverability
2. Set up proper DNS records (SPF, DKIM)
3. Monitor email delivery through Mailjet dashboard

## Troubleshooting

### Emails Not Sending

1. **Check environment variables**: Ensure `MAILJET_API_KEY` and `MAILJET_SECRET_KEY` are set
2. **Check console logs**: Look for email-related error messages
3. **Verify API credentials**: Test them in Mailjet dashboard
4. **Check spam folder**: Emails might be filtered as spam

### Email Delivery Issues

1. **Verify sender domain**: Add your domain to Mailjet and verify it
2. **Set up DNS records**: Configure SPF, DKIM records
3. **Check Mailjet dashboard**: Monitor delivery statistics
4. **Test with different email providers**: Try Gmail, Outlook, etc.

### API Rate Limits

- **Free tier**: 6,000 emails/month, 200 emails/day
- **Rate limiting**: 120 emails/minute
- **Upgrade**: Consider paid plans for higher volumes

## Email Content Customization

Email templates are defined in `lib/email.ts`. You can customize:

- **Subject lines**
- **HTML templates**
- **Text content**
- **Styling**
- **Branding**

### Modifying Templates

1. Edit `lib/email.ts`
2. Update the `htmlContent` and `textContent` variables
3. Test changes in development environment
4. Deploy to production

## Security Considerations

1. **Environment variables**: Never commit API keys to version control
2. **Rate limiting**: Implement additional rate limiting if needed
3. **Email validation**: Validate email addresses before sending
4. **Unsubscribe**: Consider adding unsubscribe functionality
5. **Data privacy**: Ensure compliance with privacy regulations

## Alternative Email Providers

If you prefer a different email service, you can modify `lib/email.ts` to support:

- **SendGrid**
- **Amazon SES**
- **Nodemailer with SMTP**
- **Resend**
- **Postmark**

The email service abstraction makes it easy to switch providers by updating the implementation in `lib/email.ts`.

## Support

- **Mailjet Documentation**: [https://dev.mailjet.com/](https://dev.mailjet.com/)
- **Mailjet Support**: Available through your Mailjet dashboard
- **Application Issues**: Check console logs and application error handling
