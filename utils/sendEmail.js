const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: { ciphers: "SSLv3" },
    service: "Outlook365",
  });

  const message = {
    from: `${process.env.FROM_NAME}, <${process.env.FROM_EMAIL}>`, // sender address
    to: options.email,
    cc: options.cc,
    subject: options.subject,
    text: options.message,
    html: `<table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout:fixed;background-color:#f9f9f9"
    id="bodyTable">
    <tbody>
        <tr>
            <td style="padding-right:10px;padding-left:10px;" align="center" valign="top" id="bodyCell">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" class="wrapperBody"
                    style="max-width:600px">
                    <tbody>
                        <tr>
                            <td align="center" valign="top">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableCard"
                                    style="background-color:#fff;border-color:#e5e5e5;border-style:solid;border-width:0 1px 1px 1px;">
                                    <tbody>
                                        <tr>
                                            <td style="background-color:#087e8c; font-size:1px;line-height:3px"
                                                class="topBorder" height="3">&nbsp;</td>
                                        </tr>
                                        <tr>
                                            <td style="padding-top: 60px; padding-bottom: 20px;" align="center"
                                                valign="middle" class="emailLogo">
                                                <a href="#" style="text-decoration:none" target="_blank">
                                                    <img alt="" border="0"
                                                        src="https://lbanlms.herokuapp.com/static/media/logo.a0fde38436990938508e.png"
                                                        style="width:100%;max-width:150px;height:auto;display:block"
                                                        width="150">
                                                </a>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td style="padding-bottom: 5px; padding-left: 20px; padding-right: 20px;"
                                                align="center" valign="top" class="mainTitle">
                                                <h2 class="text"
                                                    style="color:#000;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:28px;font-weight:500;font-style:normal;letter-spacing:normal;line-height:36px;text-transform:none;text-align:center;padding:0;margin:0">
                                                     ${options.salutation}</h2>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td style="padding-left:20px;padding-right:20px" align="center" valign="top"
                                                class="containtTable ui-sortable">
                                                <table border="0" cellpadding="0" cellspacing="0" width="100%"
                                                    class="tableDescription" style="">
                                                    <tbody>
                                                        <tr>
                                                            <td style="padding-bottom: 20px;" align="center"
                                                                valign="top" class="description">
                                                                <p class="text"
                                                                    style="color:#666;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:14px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:22px;text-transform:none;text-align:center;padding:0;margin:0">
                                                                    ${options.content}</p>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="font-size:1px;line-height:1px" height="20">&nbsp;</td>
                                        </tr>

                                    </tbody>
                                </table>
                                <table border="0" cellpadding="0" cellspacing="0" width="100%" class="space">
                                    <tbody>
                                        <tr>
                                            <td style="font-size:1px;line-height:1px" height="30">&nbsp;</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>

            </td>
        </tr>
    </tbody>
</table>`,
  };
  const info = await transporter.sendMail(message);
  console.log("Message sent: %s", info.messageId);
};

module.exports = sendEmail;
