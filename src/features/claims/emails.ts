import { Creator, CreatorClaim } from "../../db/schema";

export const generateClaimEmail = async (
  claim: CreatorClaim,
  creator: Creator,
  verificationUrl: string,
  verificationLink: string,
) => {
  return `
          <h2>Verify Your Creator Profile</h2>
          <p>Hi, ${creator.displayName}! </p>
          
          <h3>Your Verification Code:</h3>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; padding: 20px; background: #f5f5f5; text-align: center;">
            ${claim.verificationCode}
          </p>
          
          <h3>Next Steps:</h3>
          <ol>
            <li>Add this code to your website (${verificationUrl}) in one of these ways:
              <ul>
                <li>Add it as visible text on your homepage</li>
                <li>Add the line below as a meta tag:</li>
                <li><code>&lt;meta name="photobookers-verification-code" content="${claim.verificationCode}"&gt;</code></li>
              </ul>
            </li>
            <li>Once added, click the button below to verify:</li>
            <li>Once verified, you will be able to manage your creator profile from your dashboard.</li>
          </ol>
          
          <p>
            <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">
              Verify My Website
            </a>
          </p>
          
          <p><small>This code expires in 7 days. If you need a new code, please submit a new claim.</small></p>
        `;
};
