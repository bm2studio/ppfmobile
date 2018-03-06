import Realm from "realm";
import Schema from './Schema';
import { Platform } from 'react-native';

const realm = new Realm({
	schema: Schema, 
	schemaVersion: 1
});

class PPFIntegration
{
	version = 0.1;
	serverURI = "https://localhost/";
	debugMode = true;

	constructor()
	{
		this.toggleApi('api');
	}

		//======================================================//
	 //================== PRIVATE METHODS ===================//
	//======================================================//

	toggleApi( apiType = "api" )
	{
		switch(apiType){
			case 'api': this.apiType = 'api'; break;
			case 'openapi': this.apiType = 'openapi'; break;
			default: this.apiType = 'api'; break;
		}
	}

	baseURI()
	{
		var uri = this.serverURI + this.apiType + '/';
		this.toggleApi();
		return uri;
	}

	objToURL(obj)
	{
		var str = '';
		for (var key in obj) {
			if (str != '') {
				str += "&";
			}
			if(typeof obj[key] === 'object'){
				str += JSON.stringify(obj[key]);
			} else {
				str += key + "=" + encodeURIComponent(obj[key]);				
			}
		}
		return str;
	}

	async GET(endpoint, params){
		params.version = this.version;
		var url = this.baseURI() + endpoint + '/?' + this.objToURL(params);
		if(this.debugMode){ console.log("GET: ", url);	}
		let response = await fetch(url,{ method: 'GET' });
		return this.processResponse(await response.json());
	}

	async POST(endpoint, params){
		params.version = this.version;
		var url = this.baseURI() + endpoint + '/';
		if(this.debugMode){ console.log("POST: ", url, params);	}
		let data = new FormData();
		for(let prop in params){
			if(typeof params[prop] === 'object'){
				data.append(prop, JSON.stringify(params[prop]));
			} else {
				data.append(prop, params[prop]);
			}
		}
		let response = await fetch(url,{
			method: 'POST',
			body: data
		});

		return this.processResponse(await response.json());
	}

	processResponse( json )
	{
		let data = json['0'];
		let apiLog = json['1'];
		if(this.debugMode){ console.log( "API LOG:", apiLog ); }
		return data;
	}

	isFunction( func )
	{
		var getType = {};
		return func && getType.toString.call(func) === '[object Function]';
	}

	cleanRealm()
	{
		realm.write(() => {
			Schema.forEach((schema)=>{
				var schemaName = schema.schema.name;
				var obj = realm.objects(schemaName);
				realm.delete(obj);
			})
		});
	}






	//.......................






		//=====================================================//
	 //================== PUBLIC METHODS ===================//
	//=====================================================//

	//================== AUTH, SIGN UP, PSW RECOVER ===================//

	async registerStart( contractNumber )
	{
		this.toggleApi('openapi');
		return await this.POST( 'some_method_call', { contractNumber: contractNumber });
	}

	async registerEnd( contractNumber, notifType )
	{
		this.toggleApi('openapi');
		return await this.POST( 'some_method_call', {
			contractNumber: contractNumber,
			notifType: notifType
		});
	}

	async recoverPasswordEnd( login, notifType )
	{
		this.toggleApi("openapi");
		let response = await this.GET( 'some_method_call', {
			login: login,
			notif_type: notifType
		});
		return response.data;
	}
	
	async recoverPasswordBegin( login )
	{
		this.toggleApi("openapi");
		let response = await this.GET( 'some_method_call', { login: login });
		return response.data;
	}





	//.......................



}

export default PPF = new PPFIntegration();
