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
  // document.querySelector('.contain').style.display = 'block';
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  const email_contain = document.querySelector('.contain')
  if (email_contain) {
    email_contain.style.display = 'none';
  }

  var count = 0;

  function counter() {
    return count = count + 1;
  }

  // gets all the emails sent to the signed in email
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails

    console.log(emails);

    const element = document.createElement('div');
    element.className = 'wrapper'
    document.querySelector('#emails-view').append(element);

    // only displays the emails for the inbox,sent and archived section
    
    for (let i=0; i<emails.length; i++) {

      // creates a div to contain the sender's email,subject,date and time
      const div_element = document.createElement('div');
      // adds an element to the div for the sender's email
      div_element.innerHTML = emails[i].sender
      class_name = `email${counter()}`
      div_element.className = class_name
      document.querySelector('.wrapper').append(div_element);

      const container = document.querySelector(`.${class_name}`)

      // creates a span element and adds the subject of the email to it
      const span1 = document.createElement('span');
      span1.innerHTML = emails[i].subject
      span1.className = 'subject'
      container.append(span1);

      // creates another span element and adds the time and date of the email to it
      const span2 = document.createElement('span');
      span2.innerHTML = emails[i].timestamp
      span2.className = 'date'
      container.append(span2);

      if (emails[i].read) {
        container.style.backgroundColor = "grey";
      }

      container.addEventListener('click', () => {
        view_email(emails[i])
        read(emails[i].id);
      });

    }
  

  });
  if (mailbox === 'sent'){
    return true
  }
  
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
      // console.log(`these are the results ${result}:${result.message}`);

      if (result.message === 'Email sent successfully.') {
        console.log('it worked')
        //redirects the user to the sent page after the email is sent
        alert('Message Has Been Sent')
        return load_mailbox('sent')

      }
  });
  
}

function view_email(email) {
  
  document.querySelector('.wrapper').style.display = 'none';

  console.log(email.id)
  const sect_divider = document.createElement('hr')

  const container = document.createElement('div')
  container.className = 'contain'
  // container.innerHTML = `<div><span class="bold">From:</span> ${email.sender}</div>
  //                        <div><span class="bold">To:</span> ${email.recipients}</div>
  //                        <div><span class="bold">Subject:</span> ${email.subject}</div>
  //                        <div><span class="bold">Date:</span> ${email.timestamp}</div>
  //                        <hr>

  // `
  document.querySelector('#emails-view').append(container);

  const contain = document.querySelector('.contain')

  contain.append(sect_divider);
  const sender = document.createElement('div');
  sender.innerHTML = `<span class="bold">From:</span> ${email.sender}`
  contain.append(sender);

  const reciver = document.createElement('div');
  reciver.innerHTML = `<span class="bold">To:</span> ${email.recipients}`
  contain.append(reciver);

  const subject = document.createElement('div')
  subject.innerHTML = `<span class="bold">Subject:</span> ${email.subject}`
  contain.append(subject);

  const date = document.createElement('div');
  date.innerHTML = `<span class="bold">Date:</span> ${email.timestamp}`
  contain.append(date);


// reply button
  const reply = document.createElement('button');
  reply.innerHTML = 'Reply'
  reply.className = 'reply btn btn-sm btn-outline-primary'
  contain.append(reply);
  const reply_btn = document.querySelector('.reply');
  reply_btn.addEventListener('click',() => reply_func(email))
  
  if (load_mailbox('sent')) {
    console.log('sent')
  }


//archive button
  const arch = document.createElement('button');
// changes the archive button to unachive if an email is achived and viceversa
  if (!email.archived) {
    arch.innerHTML = 'Archive'
  } else {
    arch.innerHTML = 'Unarchive'
  }
  arch.className = 'archive btn btn-sm btn-outline-primary'
  contain.append(arch);
  const arch_btn = document.querySelector('.archive');
  arch_btn.addEventListener('click',() => archive(email));


  const divide = document.createElement('hr');
  contain.append(divide);

  const body = document.createElement('div');
  body.innerHTML = ` ${email.body}`
  contain.append(body)

}

//achives an email if 
function archive(email){
  if (email.archived) {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: false
      })
    })

    return load_mailbox('inbox');

  } else {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: true
      })
    })

    return load_mailbox('archive');
  }

}


function read(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
}

//fills the necessary fields when user wants to reply to an email
function reply_func(email) {
  compose_email()
  document.querySelector('#compose-recipients').value = email.sender
  const subject = document.querySelector('#compose-subject')
  email_subject = email.subject

  if (email_subject.includes('Re:')) {
    subject.value = email_subject
  } else {
    subject.value = `Re: ${email_subject}`
  }
  
  const body = document.querySelector('#compose-body')
  body.value = `On ${email.timestamp} ${email.sender}\n wrote: ${email.body} \n`
 
  

}