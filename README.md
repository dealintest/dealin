# Summary

Repo for dealin developer test.  
There are two files containing the source code.   
database.js and paystack.js   
  
database.js contains the code that talks to a mongodb instance on mlab. It implements a simple address book api.  
  
### DB API
- Root API Deployed to https://g58mabq0e3.execute-api.us-east-2.amazonaws.com/test
- POST /test { firstname:"", lastname: "", phone: "", email: ""}
- GET /test/?[ name=[query name]&phone=[query phone]&email=[query email] ]
- PUT /test { firstname:"", lastname: "", email: "", phone: ""}
- DELETE /test {phone: ""}

  
paystack.js contains the code that exposes a simple paystack api integration. valid operations are create customer, list customer, create transactions and list transactions. All operations exposed as get request.   

### Paystack API
- Root API Deployed to https://5casksr90f.execute-api.us-east-2.amazonaws.com/payment
- GET /payment?ops=create-customer&firstname=&lastname=&email=
- GET /payment?ops=list-customers
- GET /payment?ops=init-transaction&email=&amount=
- GET /payment?ops=list-transactions

# Install

- Clone Repo
- Run npm install
- Zip up repo folder and Deploy to AWS lambda

## aws-sam-cli

We had issues setting this up locally as we currently use Windows 10 Systems and use Docker Toolbox to run docker locally. The full docker app is only available for WIndows 10 Professional and Windows Server 2018. Currently it looks like aws-sam-cli does not work with docker toolbox.   
If aws-sam-cli is part of your CI/CD Process, we can always get dedicated linux PCs.