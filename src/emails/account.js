const sgMail=require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail= (email,name)=>{

    sgMail.send({
        to : email,
        from : 'manasab201@gmail.com',
        subject: 'Welcome',
        text: `Welcome to the app ${name}. Let me know how you get along with the same`
    })

}

const sendCancelEmail= (email,name) =>
{
    sgMail.send({
        to : email,
        from : 'manasab201@gmail.com',
        subject: 'Cancellation',
        text : `TO verify that you, ${name} are cancelling your account. `
    })
}

module.exports= {
    sendWelcomeEmail ,
    sendCancelEmail
}