document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email('compose'));
  document.querySelector('#submit').addEventListener('click', send_mail);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(id) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email').style.display = 'none';

  if (id == 'compose')
  {
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  }
  else
  {
    fetch(`emails/${id}`)
    .then(response => response.json())
    .then(email => {
      //Because this is a reply
      recipient = email.sender

      body = `On ${email.timestamp} ${recipient} wrote: ${email.body}`;
      subject = `${email.subject}`;

      let re = "Re: ";
      
      let counter = 0;
      //The loop doesn't iterate!
      for (let i = 0; i < re.length; i++)
      {
        if (subject[i] === re[i])
        {
          counter++;
        }
      }
      
      if (counter != re.length)
      {
        subject = `Re: ${subject}`
      }
      
      document.querySelector('#compose-recipients').value = `${recipient}`;
      document.querySelector('#compose-subject').value = `${subject}`;
      document.querySelector('#compose-body').value = `${body}`;
    })
  }
}

function load_mailbox(mailbox) {
  
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(element => {
      const div = document.createElement('div');
      sender = element.sender;
      subject = element.subject;
      timestamp = element.timestamp;
      read = element.read;
      div.style.border = "thin solid black";
      div.innerHTML = [sender, subject, timestamp];

      if (read == true) {
        div.style.backgroundColor = "gray";
      }
      else {
        div.style.backgroundColor = "white";
      }
      document.querySelector('#emails-view').append(div);

      if (mailbox == 'archive')
      {
        const input = document.createElement('input');
        input.setAttribute('type', 'submit');
        input.setAttribute('value', 'Unarchive');
        input.setAttribute('id', element.id);
        document.querySelector('#emails-view').append(input);
        input.addEventListener('click', () => {
          fetch(`/emails/${element.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: false
            })
          })
          location.reload();
          load_mailbox('inbox')
        })
      }
      else if (mailbox == 'inbox')
      {
        const input = document.createElement('input');
        input.setAttribute('type', 'submit');
        input.setAttribute('value', 'Archive');
        input.setAttribute('id', element.id);
        document.querySelector('#emails-view').append(input);
        input.addEventListener('click', () => {
          fetch(`/emails/${element.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: true
            })
          })
          location.reload();
        })
      }
      div.addEventListener('click', () => viewEmail(element.id));
    });
  })
}

function send_mail(e) {
  
  e.preventDefault()
  const recipients = document.querySelector("#compose-recipients").value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body
      })
    })
    .then(response => response.json())
    load_mailbox('sent')
};

function viewEmail(email_id) {

  // Show the email view and hide others
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email').style.display = 'block';

  fetch(`emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    sender = email.sender;
    recipients = email.recipients;
    subject = email.subject;
    timestamp = email.timestamp;
    body = email.body;
    document.querySelector('#email').innerHTML = `<div>Sender: ${sender}</div><div>Recipients: ${recipients}</div><div>Subject: ${subject}</div><div>${timestamp}</div><div>${body}</div>`
    const input = document.createElement('input');
    input.setAttribute('type', 'submit');
    input.setAttribute('value', 'Reply');
    document.querySelector('#email').append(input);
    input.addEventListener('click', () => compose_email(email.id));
  })

  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}
