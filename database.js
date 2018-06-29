// Coded for API GATEWAY PROXY INTEGRATION
// Deployed to https://g58mabq0e3.execute-api.us-east-2.amazonaws.com/test

const mongodb = require('mongodb').MongoClient;
const url = 'mongodb://dealintest:dealintest2@ds121321.mlab.com:21321/dealin_crud_test';
const dbName = 'dealin_crud_test';

function extractBody(event){
	var ret = {};
	switch(event.httpMethod.toUpperCase()){
		case "POST":
		case "DELETE":
		case "PUT":
			try{ 
				ret = JSON.parse(event.body); 
			}
			catch(e){ 
				ret = decodeQueryString(event.body); 
			}
		break;
		case "GET":
			ret = event.queryStringParameters;
		break;
		default:
			try{ 
				ret = JSON.parse(event.body); 
			}
			catch(e){ 
				ret = decodeQueryString(event.body); 
			}
		break;

	}
	
	if(event.httpMethod.toUpperCase() == "GET"){ ret.ops = "read"; }
	if(event.httpMethod.toUpperCase() == "POST"){ ret.ops = "create"; }
	if(event.httpMethod.toUpperCase() == "PUT"){ ret.ops = "update"; }
	if(event.httpMethod.toUpperCase() == "DELETE"){ ret.ops = "delete"; }
	return ret;
}

function decodeQueryString(str){
	var ret = {};
	var vars = str.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        ret[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }
	return ret;
}

exports.handler = async function(event, context){
	
	let body = extractBody(event);

	let res = {
		"statusCode": 200,
		"body": ""
	};
	
	let err = {
		"statusCode": 400,
		"body": ""
	};
	
	if(!body.ops){ err.body = "Expecting Ops Parameter"; return err; }
	if(!body.phone && body.ops !== 'read'){ err.body = "Expecting phone Parameter"; return err; }
	
	
	
	let db;
	let client;
	let collection;
	
	try{
		client = await mongodb.connect(url, {useNewUrlParser: true});
		db = client.db(dbName);
		collection = db.collection("lambda_address_book");
	}
	catch(e){ client.close(); err.body = "DB Exception. Failed to connect to DB"; return err; }
	
	var ops = body.ops;
	switch(ops){
		case "create":
			if(!body.firstname || !body.lastname || !body.phone || !body.email){
				err.body = "Provide full details. firstname, lastname, email, phone"; return err;
			}
			var exists = await collection.find({phone: body.phone}).limit(1).toArray();
			if(exists.length > 0){ client.close(); err.body = "Error. Phone Number already in Address Book."; return err; }
			
			var entry = {
				firstname: body.firstname,
				lastname: body.lastname,
				phone: body.phone,
				email: body.email,
				timestamp: new Date()
			};
			
			var result = await collection.insertOne(entry);
			client.close();
			res.body = "New Entry created";
			return res;
		break;
		case "read":
			var search = {};
			if(body.name){ 
				search.$or = [
					{firstname: {$regex: body.name, $options: 'i'} }, 
					{lastname: {$regex: body.name, $options: 'i'} }
				]; 
			}
			if(body.phone){ search.phone = {$regex: body.phone, $options: 'i'}; }
			if(body.email){ search.email = {$regex: body.email, $options: 'i'}; }
			
			if(Object.keys(search).length === 0 ){
				client.close();
				err.body = "Provide at least one filter parameter [name, phone or email]";
				return err;
			}
			
			var result = await collection.find(search).limit(100).toArray();
			client.close();
			res.body = JSON.stringify(result);
			return res;
		break;
		case "update":
			
			var entry = await collection.find({phone: body.phone}).limit(1).toArray();
			if(entry.length < 1){ 
				client.close(); 
				err.body = "Error. No Entry with that phone number in address book"; 
				return err;
			}
			
			var set = {};
			if(body.firstname){ set.firstname = body.firstname; }
			if(body.lastname){ set.lastname = body.lastname; }
			if(body.email){ set.email = body.email; }
			
			if(Object.keys(set).length === 0 ){
				client.close();
				err.body = "Provide at least one update parameter [firstname, lastname or email]";
				return err;
			}
			
			var result = await collection.updateOne({phone: body.phone}, {$set: set} );
			client.close();
			res.body = "Entry Updated";
			return res;
		break;
		case "delete":
			
			var entry = await collection.find({phone: body.phone}).limit(1).toArray();
			if(entry.length < 1){ 
				client.close(); 
				err.body = "Error. No Entry with that phone number in address book"; 
				return err; 
			}
			
			var result = await collection.deleteOne({phone: body.phone} );
			client.close();
			res.body = "Entry Deleted";
			return res;
		break;
		default:
			var result = await collection.find({}).limit(100).toArray();
			client.close();
			res.body = JSON.stringify(result);
			return res;
		break;
	}
}