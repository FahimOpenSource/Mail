document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('form').onsubmit = function() {

    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;
    submit_email(recipients, subject, body);

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

  var count = 0;

  function counter() {
    return count = count + 1;
  }

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails

    console.log(emails);


    if (mailbox === 'inbox') {
      for (let i=0; i<emails.length; i++) {
        const div_element = document.createElement('div');
        div_element.innerHTML = emails[i].sender
        class_name = `email${counter()}`
        div_element.className = class_name
        document.querySelector('#emails-view').append(div_element);

        const span1 = document.createElement('span');
        const container = document.querySelector(`.${class_name}`)
        span1.innerHTML = emails[i].subject
        span1.className = 'subject'
        container.append(span1);
        
        const span2 = document.createElement('span');
        span2.innerHTML = emails[i].timestamp
        span2.className = 'date'
        container.append(span2);
  
      }
    }

  });


}


function submit_email(recipients,subject,body) {
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      console.log(`these are the results ${result}:${result.message}`);

      if (result.message === 'Email sent successfully.') {
        console.log('it worked')
        return load_mailbox('sent')

      }
  });
  
  // console.error();
  // 
}