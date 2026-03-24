import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'noreply@golfcharity.com';

export async function sendWelcomeEmail(to: string, name: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: 'Welcome to Golf Charity — You\'re In! 🏌️',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #111; color: #fff; padding: 40px; border-radius: 12px;">
        <h1 style="color: #F5A623; font-size: 28px;">Welcome, ${name}!</h1>
        <p style="color: #ccc; line-height: 1.6;">You've successfully joined Golf Charity — where every swing makes a difference.</p>
        <p style="color: #ccc;">Here's what you can do now:</p>
        <ul style="color: #ccc; line-height: 2;">
          <li>📊 Log your Stableford golf scores</li>
          <li>🎰 Enter the monthly prize draw</li>
          <li>💚 Support your chosen charity</li>
        </ul>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
           style="display: inline-block; background: #F5A623; color: #000; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">
          Go to Dashboard
        </a>
      </div>
    `,
  });
}

export async function sendDrawResultsEmail(
  to: string,
  name: string,
  winningNumbers: number[],
  drawMonth: string
) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `${drawMonth} Draw Results Are In! 🎰`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #111; color: #fff; padding: 40px; border-radius: 12px;">
        <h1 style="color: #F5A623;">Results Are In!</h1>
        <p style="color: #ccc;">Hi ${name}, the ${drawMonth} draw has been completed.</p>
        <div style="background: #1C1C1C; padding: 24px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="color: #999; margin-bottom: 12px;">Winning Numbers</p>
          <div style="display: flex; gap: 12px; justify-content: center;">
            ${winningNumbers.map(n => `<span style="background: #F5A623; color: #000; width: 44px; height: 44px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px;">${n}</span>`).join('')}
          </div>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/draws" 
           style="display: inline-block; background: #F5A623; color: #000; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Check Your Numbers
        </a>
      </div>
    `,
  });
}

export async function sendWinnerEmail(
  to: string,
  name: string,
  matchType: string,
  prizeAmount: number
) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: '🏆 Congratulations — You\'ve Won!',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #111; color: #fff; padding: 40px; border-radius: 12px;">
        <h1 style="color: #F5A623;">You're a Winner! 🎉</h1>
        <p style="color: #ccc;">Incredible news, ${name}!</p>
        <div style="background: #1C1C1C; border: 2px solid #F5A623; padding: 24px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="color: #999;">${matchType}</p>
          <p style="color: #F5A623; font-size: 36px; font-weight: bold; margin: 8px 0;">£${(prizeAmount / 100).toFixed(2)}</p>
        </div>
        <p style="color: #ccc;">Please upload your score verification to claim your prize.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/winnings" 
           style="display: inline-block; background: #F5A623; color: #000; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Claim Your Prize
        </a>
      </div>
    `,
  });
}

export async function sendSubscriptionEmail(
  to: string,
  name: string,
  type: 'renewed' | 'cancelled' | 'payment_failed',
  renewalDate?: string
) {
  const subjects = {
    renewed: '✅ Subscription Renewed Successfully',
    cancelled: 'Subscription Cancellation Confirmed',
    payment_failed: '⚠️ Payment Failed — Action Required',
  };

  const messages = {
    renewed: `Your subscription has been renewed${renewalDate ? ` until ${renewalDate}` : ''}. You're all set for the next draw!`,
    cancelled: 'Your subscription has been cancelled. You\'ll retain access until the end of your current period.',
    payment_failed: 'We were unable to process your payment. Please update your payment details to avoid losing access.',
  };

  return resend.emails.send({
    from: FROM,
    to,
    subject: subjects[type],
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #111; color: #fff; padding: 40px; border-radius: 12px;">
        <h1 style="color: #F5A623;">Subscription Update</h1>
        <p style="color: #ccc;">Hi ${name},</p>
        <p style="color: #ccc;">${messages[type]}</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
           style="display: inline-block; background: #F5A623; color: #000; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">
          Manage Account
        </a>
      </div>
    `,
  });
}
