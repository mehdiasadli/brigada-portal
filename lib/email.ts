import Mailjet from 'node-mailjet';
import { UserRole, DocumentCategory } from '@prisma/client';

// Initialize Mailjet client
const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY!,
  apiSecret: process.env.MAILJET_SECRET_KEY!,
});

const getRoleDisplayName = (role: UserRole) => {
  switch (role) {
    case UserRole.USER:
      return 'İstifadəçi';
    case UserRole.EDITOR:
      return 'Redaktor';
    case UserRole.JOURNALIST:
      return 'Jurnalist';
    case UserRole.OFFICIAL:
      return 'İcma Rəsmisi';
    case UserRole.MODERATOR:
      return 'Moderator';
    case UserRole.ADMIN:
      return 'Administrator';
    default:
      return role;
  }
};

interface RoleAssignmentEmailData {
  userName: string;
  userEmail: string;
  roles: UserRole[];
  assignedBy: string;
}

export async function sendRoleAssignmentEmail({
  userName,
  userEmail,
  roles,
  assignedBy,
}: RoleAssignmentEmailData): Promise<boolean> {
  try {
    // Skip sending email if no API keys are configured
    if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_SECRET_KEY) {
      console.warn('Mailjet API keys not configured. Skipping email notification.');
      return false;
    }

    const rolesList = roles.map(getRoleDisplayName).join(', ');
    const hasRoles = roles.length > 0;

    const subject = hasRoles
      ? 'Hesabınıza Rol Təyin Edildi - Brigada Portal'
      : 'Hesab Rolları Yeniləndi - Brigada Portal';

    const htmlContent = `
<!DOCTYPE html>
<html lang="az">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body {
            font-family: 'Georgia', 'Times New Roman', serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: #ffffff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #1e40af;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #1e40af;
            margin: 0;
            font-size: 24px;
        }
        .content {
            margin-bottom: 30px;
        }
        .roles-box {
            background-color: ${hasRoles ? '#f0f9ff' : '#fef3c7'};
            border: 2px solid ${hasRoles ? '#3b82f6' : '#f59e0b'};
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
        }
        .roles-title {
            font-weight: bold;
            color: ${hasRoles ? '#1e40af' : '#92400e'};
            margin-bottom: 10px;
            font-size: 16px;
        }
        .roles-list {
            color: ${hasRoles ? '#1e40af' : '#92400e'};
            font-size: 18px;
            font-weight: bold;
        }
        .action-box {
            background-color: #f8fafc;
            border-left: 4px solid #1e40af;
            padding: 20px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            background-color: #1e40af;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 10px 0;
        }
        .button:hover {
            background-color: #1d4ed8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏛️ Brigada Portal</h1>
            <p>Rəsmi İcma Portalı</p>
        </div>
        
        <div class="content">
            <h2>Salam, ${userName}!</h2>
            
            <p>Hesabınızın rol statusu yeniləndi.</p>
            
            <div class="roles-box">
                <div class="roles-title">
                    ${hasRoles ? 'Təyin Edilmiş Rollar:' : 'Hesab Statusu:'}
                </div>
                <div class="roles-list">
                    ${hasRoles ? rolesList : 'Rol yoxdur - Administrasiya yoxlanması gözlənilir'}
                </div>
            </div>
            
            ${
              hasRoles
                ? `
                <div class="action-box">
                    <h3>🎉 Təbriklər!</h3>
                    <p>
                        Hesabınız təsdiqləndi və sizə ${rolesList} ${roles.length > 1 ? 'rolları' : 'rolu'} təyin edildi.
                        İndi portala tam giriş əldə edə və öz səlahiyyətləriniz daxilində fəaliyyət göstərə bilərsiniz.
                    </p>
                    <p style="text-align: center;">
                        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}" class="button">
                            Portala Daxil Ol
                        </a>
                    </p>
                </div>
            `
                : `
                <div class="action-box">
                    <h3>⏳ Hesab İcmalı</h3>
                    <p>
                        Hesabınızdan bütün rollar silindi və hesabınız yenidən yoxlanma prosesindədir.
                        Yeni rol təyinatı üçün administrasiya qərarını gözləyin.
                    </p>
                </div>
            `
            }
            
            <p><strong>Rol təyin edən administrator:</strong> ${assignedBy}</p>
            <p><strong>Tarix:</strong> ${new Date().toLocaleDateString('az-AZ', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}</p>
        </div>
        
        <div class="footer">
            <p>
                Bu e-poçt avtomatik olaraq göndərilib.<br>
                Suallarınız üçün: <a href="mailto:asadlimehdi25@gmail.com">asadlimehdi25@gmail.com</a>
            </p>
            <p>
                <strong>Brigada Portal</strong> - Brigada İcmasının Rəsmi Portalı
            </p>
        </div>
    </div>
</body>
</html>
    `;

    const textContent = `
${subject}

Salam, ${userName}!

Hesabınızın rol statusu yeniləndi.

${hasRoles ? `Təyin Edilmiş Rollar: ${rolesList}` : 'Hesab Statusu: Rol yoxdur - Administrasiya yoxlanması gözlənilir'}

${
  hasRoles
    ? `Təbriklər! Hesabınız təsdiqləndi və sizə ${rolesList} ${roles.length > 1 ? 'rolları' : 'rolu'} təyin edildi. İndi portala tam giriş əldə edə bilərsiniz.`
    : 'Hesabınızdan bütün rollar silindi və hesabınız yenidən yoxlanma prosesindədir.'
}

Rol təyin edən administrator: ${assignedBy}
Tarix: ${new Date().toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}

Portal: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}

Bu e-poçt avtomatik olaraq göndərilib.
Suallarınız üçün: asadlimehdi25@gmail.com

Brigada Portal - Brigada İcmasının Rəsmi Portalı
    `;

    const request = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_FROM_EMAIL || 'noreply@brigada.gov.az',
            Name: 'Brigada Portal',
          },
          To: [
            {
              Email: userEmail,
              Name: userName,
            },
          ],
          Subject: subject,
          TextPart: textContent,
          HTMLPart: htmlContent,
        },
      ],
    });

    console.log('Email sent successfully:', request.body);
    return true;
  } catch (error) {
    console.error('Failed to send role assignment email:', error);
    return false;
  }
}

export async function sendWelcomeEmail(userName: string, userEmail: string): Promise<boolean> {
  try {
    // Skip sending email if no API keys are configured
    if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_SECRET_KEY) {
      console.warn('Mailjet API keys not configured. Skipping welcome email.');
      return false;
    }

    const subject = 'Xoş Gəlmisiniz - Brigada Portal';

    const htmlContent = `
<!DOCTYPE html>
<html lang="az">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body {
            font-family: 'Georgia', 'Times New Roman', serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: #ffffff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #1e40af;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #1e40af;
            margin: 0;
            font-size: 24px;
        }
        .welcome-box {
            background-color: #f0f9ff;
            border: 2px solid #3b82f6;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏛️ Brigada Portal</h1>
            <p>Rəsmi İcma Portalı</p>
        </div>
        
        <div class="content">
            <h2>Xoş Gəlmisiniz, ${userName}!</h2>
            
            <div class="welcome-box">
                <h3>🎉 Hesab Yaradıldı</h3>
                <p>
                    Brigada Portal-da hesabınız uğurla yaradıldı. 
                    Hesabınız hal-hazırda administrasiya tərəfindən yoxlanılır.
                </p>
            </div>
            
            <p>
                Portala tam giriş üçün adminlərin təsdiqini gözləyin. 
                Təsdiq prosesi adətən 1-2 iş günü çəkir.
            </p>
            
            <p>
                Təsdiqdən sonra ayrıca e-poçt bildirişi alacaqsınız və 
                portala tam giriş əldə edəcəksiniz.
            </p>
        </div>
        
        <div class="footer">
            <p>
                Bu e-poçt avtomatik olaraq göndərilib.<br>
                Suallarınız üçün: <a href="mailto:asadlimehdi25@gmail.com">asadlimehdi25@gmail.com</a>
            </p>
            <p>
                <strong>Brigada Portal</strong> - Brigada İcmasının Rəsmi Portalı
            </p>
        </div>
    </div>
</body>
</html>
    `;

    const textContent = `
${subject}

Xoş Gəlmisiniz, ${userName}!

Brigada Portal-da hesabınız uğurla yaradıldı. 
Hesabınız hal-hazırda administrasiya tərəfindən yoxlanılır.

Portala tam giriş üçün adminlərin təsdiqini gözləyin. 
Təsdiq prosesi adətən 1-2 iş günü çəkir.

Təsdiqdən sonra ayrıca e-poçt bildirişi alacaqsınız və 
portala tam giriş əldə edəcəksiniz.

Bu e-poçt avtomatik olaraq göndərilib.
Suallarınız üçün: asadlimehdi25@gmail.com

Brigada Portal - Brigada İcmasının Rəsmi Portalı
    `;

    const request = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_FROM_EMAIL || 'noreply@brigada.gov.az',
            Name: 'Brigada Portal',
          },
          To: [
            {
              Email: userEmail,
              Name: userName,
            },
          ],
          Subject: subject,
          TextPart: textContent,
          HTMLPart: htmlContent,
        },
      ],
    });

    console.log('Welcome email sent successfully:', request.body);
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}

const getDocumentCategoryDisplayName = (category: DocumentCategory) => {
  switch (category) {
    case DocumentCategory.CONSTITUTION:
      return 'Konstitusiya';
    case DocumentCategory.LAW:
      return 'Qanun';
    case DocumentCategory.CODE:
      return 'Məcəllə';
    case DocumentCategory.DECREE:
      return 'Fərman';
    case DocumentCategory.RESOLUTION:
      return 'Qərar';
    case DocumentCategory.REGULATION:
      return 'Tənzimləmə';
    case DocumentCategory.OTHER:
      return 'Digər';
    default:
      return category;
  }
};

interface DocumentNotificationEmailData {
  documentTitle: string;
  documentSlug: string;
  documentCategory: DocumentCategory;
  authorName: string;
  isNewDocument: boolean; // true for new, false for status change to published
  userEmail: string;
  userName: string;
}

export async function sendDocumentNotificationEmail({
  documentTitle,
  documentSlug,
  documentCategory,
  authorName,
  isNewDocument,
  userEmail,
  userName,
}: DocumentNotificationEmailData): Promise<boolean> {
  try {
    // Skip sending email if no API keys are configured
    if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_SECRET_KEY) {
      console.warn('Mailjet API keys not configured. Skipping document notification email.');
      return false;
    }

    const categoryDisplay = getDocumentCategoryDisplayName(documentCategory);
    const documentUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/docs/${documentSlug}`;

    const subject = isNewDocument
      ? `Yeni Sənəd Yaradıldı: ${documentTitle} - Brigada Portal`
      : `Sənəd Nəşr Edildi: ${documentTitle} - Brigada Portal`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="az">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body {
            font-family: 'Georgia', 'Times New Roman', serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: #ffffff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #1e40af;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #1e40af;
            margin: 0;
            font-size: 24px;
        }
        .content {
            margin-bottom: 30px;
        }
        .document-box {
            background-color: #f0f9ff;
            border: 2px solid #3b82f6;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .document-title {
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
            font-size: 18px;
        }
        .document-info {
            color: #1e40af;
            font-size: 14px;
            margin-bottom: 8px;
        }
        .action-box {
            background-color: #f8fafc;
            border-left: 4px solid #1e40af;
            padding: 20px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            background-color: #1e40af;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 10px 0;
        }
        .button:hover {
            background-color: #1d4ed8;
        }
        .status-badge {
            background-color: ${isNewDocument ? '#dcfce7' : '#fef3c7'};
            color: ${isNewDocument ? '#166534' : '#92400e'};
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏛️ Brigada Portal</h1>
            <p>Rəsmi İcma Portalı</p>
        </div>
        
        <div class="content">
            <h2>Salam, ${userName}!</h2>
            
            <p>
                ${
                  isNewDocument
                    ? 'Portala yeni sənəd əlavə edildi:'
                    : 'Mövcud sənəd nəşr edildi və indi görünən statusdadır:'
                }
            </p>
            
            <div class="document-box">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <span class="status-badge">
                        ${isNewDocument ? 'Yeni Sənəd' : 'Nəşr Edildi'}
                    </span>
                </div>
                
                <div class="document-title">${documentTitle}</div>
                
                <div class="document-info">
                    <strong>Kateqoriya:</strong> ${categoryDisplay}
                </div>
                <div class="document-info">
                    <strong>Müəllif:</strong> ${authorName}
                </div>
                <div class="document-info">
                    <strong>Tarix:</strong> ${new Date().toLocaleDateString('az-AZ', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                </div>
            </div>
            
            <div class="action-box">
                <h3>📄 Sənədi Oxuyun</h3>
                <p>
                    ${
                      isNewDocument
                        ? 'Yeni əlavə edilmiş sənədi oxumaq və yükləmək üçün:'
                        : 'İndi nəşr edilmiş sənədi oxumaq və yükləmək üçün:'
                    }
                </p>
                <p style="text-align: center;">
                    <a href="${documentUrl}" class="button">
                        Sənədi Aç
                    </a>
                </p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280;">
                Bu bildiriş avtomatik olaraq göndərilib. Sənəd yaradılan və ya nəşr edilən zaman 
                bütün istifadəçilər məlumatlandırılır.
            </p>
        </div>
        
        <div class="footer">
            <p>
                Bu e-poçt avtomatik olaraq göndərilib.<br>
                Suallarınız üçün: <a href="mailto:asadlimehdi25@gmail.com">asadlimehdi25@gmail.com</a>
            </p>
            <p>
                <strong>Brigada Portal</strong> - Brigada İcmasının Rəsmi Portalı
            </p>
        </div>
    </div>
</body>
</html>
    `;

    const textContent = `
${subject}

Salam, ${userName}!

${isNewDocument ? 'Portala yeni sənəd əlavə edildi:' : 'Mövcud sənəd nəşr edildi və indi görünən statusdadır:'}

Sənəd: ${documentTitle}
Kateqoriya: ${categoryDisplay}
Müəllif: ${authorName}
Tarix: ${new Date().toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}

Sənədi oxumaq üçün: ${documentUrl}

${
  isNewDocument
    ? 'Yeni əlavə edilmiş sənədi oxumaq və yükləmək üçün yuxarıdakı linki izləyin.'
    : 'İndi nəşr edilmiş sənədi oxumaq və yükləmək üçün yuxarıdakı linki izləyin.'
}

Bu bildiriş avtomatik olaraq göndərilib. Sənəd yaradılan və ya nəşr edilən zaman 
bütün istifadəçilər məlumatlandırılır.

Bu e-poçt avtomatik olaraq göndərilib.
Suallarınız üçün: asadlimehdi25@gmail.com

Brigada Portal - Brigada İcmasının Rəsmi Portalı
    `;

    const request = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_FROM_EMAIL || 'noreply@brigada.gov.az',
            Name: 'Brigada Portal',
          },
          To: [
            {
              Email: userEmail,
              Name: userName,
            },
          ],
          Subject: subject,
          TextPart: textContent,
          HTMLPart: htmlContent,
        },
      ],
    });

    console.log('Document notification email sent successfully:', request.body);
    return true;
  } catch (error) {
    console.error('Failed to send document notification email:', error);
    return false;
  }
}

// Helper function to send document notifications to all users except the author
export async function sendDocumentNotificationToAllUsers({
  documentTitle,
  documentSlug,
  documentCategory,
  authorName,
  authorId,
  isNewDocument,
}: {
  documentTitle: string;
  documentSlug: string;
  documentCategory: DocumentCategory;
  authorName: string;
  authorId: string;
  isNewDocument: boolean;
}): Promise<void> {
  try {
    // Skip sending email if no API keys are configured
    if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_SECRET_KEY) {
      console.warn('Mailjet API keys not configured. Skipping document notification emails.');
      return;
    }

    // Import prisma here to avoid circular dependencies
    const { prisma } = await import('@/lib/prisma');

    // Get all users except the author who have roles (approved users)
    const users = await prisma.user.findMany({
      where: {
        id: { not: authorId },
        roles: { isEmpty: false }, // Only send to users with roles
      },
      select: {
        email: true,
        name: true,
      },
    });

    console.log(`Sending document notification to ${users.length} users for document: ${documentTitle}`);

    // Send emails in batches to avoid rate limiting
    const batchSize = 10;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);

      await Promise.all(
        batch.map((user) =>
          sendDocumentNotificationEmail({
            documentTitle,
            documentSlug,
            documentCategory,
            authorName,
            isNewDocument,
            userEmail: user.email,
            userName: user.name,
          })
        )
      );

      // Add small delay between batches to respect rate limits
      if (i + batchSize < users.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(`Successfully sent document notifications to ${users.length} users`);
  } catch (error) {
    console.error('Failed to send document notifications to all users:', error);
  }
}
