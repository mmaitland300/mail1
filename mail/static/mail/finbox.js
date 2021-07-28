document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = () => {
    fetch('/emails' , {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
      console.log(result);
      load_mailbox('sent');
    });
    return false;
  }

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  


  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(email => {
      if (mailbox === 'inbox' ) {
        let emails_div = document.createElement('div');
        emails_div.innerHTML = `
          <hr>
          
          <h6 style="text-align: center;">From: ${email.sender}</h6>
          <h6 style="text-align: center;">Subject: ${email.subject}</h6>
          <hr>`;
        emails_div.addEventListener('click', () => load_email(email.id))
        document.querySelector('#emails-view').append(emails_div);
      }
      else if (mailbox === 'sent' ) {
        let emails_div = document.createElement('div');
        emails_div.innerHTML = `
          <hr>
          <h6 style="text-align: center;">To: ${email.recipients}</h6>
          <h6 style="text-align: center;">Subject: ${email.subject}</h6>
          <hr>`;
        document.querySelector('#emails-view').append(emails_div);
      }

    });
  });
}

function load_email(email_id) {

  // Show the mailbox and hide other views
  let emails_view = document.querySelector('#emails-view');
  emails_view.innerHTML = '';

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {

    let emails_div = document.createElement('div');
    emails_div.innerHTML = `
    <hr>
    <h6>From: ${email.sender}</h6>
    <h6>Subject: ${email.subject}</h6>
    <hr>
    <p>${email.body}</p>
    <hr>
    <p><strong>Date: ${email.timestamp}</strong></p>`;
    emails_view.append(emails_div);
    let reply = document.createElement('button');
    reply.innerHTML = "Reply";
    emails_view.append(reply);
    reply.addEventListener("click", () => {
      // Show compose view and hide other views
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'block';
    
      // Clear out composition fields
      document.querySelector('#compose-recipients').value = email.sender;
      document.querySelector('#compose-subject').value = `RE: ${email.subject}`;
      document.querySelector('#compose-body').value = '';
    });
    if (email.read === false) {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
      })
    }

  });



}

