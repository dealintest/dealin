// Coded for API GATEWAY PROXY INTEGRATION
// Deployed to https://5casksr90f.execute-api.us-east-2.amazonaws.com/payment

const paystack = require('paystack')('sk_test_b1ae5a7677ce8f502f98b5737d1c67e128ed525f');


exports.handler = async function(event, context){
	
	if(!event.queryStringParameters){ return {statusCode: 400, body:"Expecting 'ops' Parameter"}; }
	let body = event.queryStringParameters; // Processes only Get Requests
	
	// API GATEWAY PROXY Expects all responses in the JSON format below
	// body must be stringified
	let res = {
		"statusCode": 200,
		"body": ""
	};
	
	let err = {
		"statusCode": 400,
		"body": ""
	};
	
	if(!body.ops){
		err.body = "Expecting ops parameter";
		return err;
	}
	let ops = body.ops;
	
	switch(ops){
		case "create-customer":
			if(!body.firstname || !body.lastname || !body.email){
				err.body = "Missing fields. Provide [firstname, lastname and email]";
				return err;
			}
			
			try{
				var result = await paystack.customer.create({
					first_name: body.firstname,
					last_name: body.lastname,
					email: body.email
				});
				res.body = JSON.stringify(result);
				return res;
			}catch(e){
				err.body = e.message;
				return err;
			}
		break;
		case "init-transaction":
			if(!body.email || !body.amount){
				err.body = "Send email and amount";
				return err;
			}
			var result = await paystack.transaction.initialize({
								email: body.email,
								amount: body.amount * 100
							  });
			res.body = JSON.stringify(result);
			return res;
		break;
		case "list-customers":
			var result = await paystack.customer.list();
			res.body = JSON.stringify(result);
			return res;
		break;
		case "list-transactions":
			var result = await paystack.transaction.list();
			res.body = JSON.stringify(result);
			return res;
		break;
		default:
			err.body = "Invalid operation. Valid values for ops are 'create-customer', 'list-customers', 'init-transaction' and 'list-transactions'";
			return err;
		break;
	}
}