Scalarm Chart Service
===================

Installation guide
------------------
1. Install dependencies:
   	* Node.js - via package manager [[link](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)]:

			curl -sL https://deb.nodesource.com/setup | sudo bash -
			sudo apt-get install -y nodejs

	* libraries required by npm for building:

			sudo apt-get install build-essential

2. Download Scalarm Chart Service from repository:
	* using git:
		
			git clone https://github.com/Scalarm/scalarm_chart_service.git
		
	* using wget:

			wget https://github.com/Scalarm/scalarm_chart_service/archive/master.zip -O scalarm_chart_service.zip
			unzip scalarm_chart_service.zip -d scalarm_chart_service/
			rm scalarm_chart_service.zip

3. Install npm dependencies:

		npm update && npm install
		
4. Set proper configuration:
	* **config.js.template**

			module.exports = {
				server_ip: <<SERVER_IP>>,
				server_port: 8080,
				server_prefix: "/chart",
				information_service_address: process.env.INFORMATION_SERVICE_URL,
				information_service_development: true,
				multicast_address: "224.1.2.3",
				multicast_port: 8000,
				log_filename: <<LOG_FILENAME>>
			}

		and rename it to *config.js*
	
		Description:
		* *server_ip*: IP address of Chart Service 
		* *server_port*: port of Chart Service
		* *server_prefix*: prefix added to every link generated from Chart Service (for load balancing)
		* *information_service_address*: IP address of Information Service
		*  *information_service_development*: flag when using Information Service in development mode
		* *multicast_address*: multicast address on which Load Balancer send messages
		* *multicast_port*: multicast port on which Load Balancer send messages
		* *log_filename*: name of the log file


	* **decoder_configuration.js.template**
	
			module.exports = {
				secret_key_base: process.env.INFORMATION_SERVICE_URL,
				encrypted_cookie_salt: "<<COOKIE_SALT>>",
				encrypted_signed_cookie_salt: "<<SIGNED_COOKIE_SALT>>",
				iterations: 1000,
				keylen: 64,
				cipherName: 'aes-256-cbc'
			};
	 
		and rename it to *decoder_configuration.js*
	
		Description:
		* *secret_key_base*: secret key base for Scalarm instance
		* *encrypted_cookie_salt*: salt for cookies
		* *encrypted_signed_cookie_salt*: salt for signed cookies
		* *iterations*: number of iterations
		* *keylen*: length of key
		* *cipherName*: ciphering algorithm

> Please make sure that on the machine is installed ruby - this requirement is necessary for working the whole module!

Running
-----------------

Starting server: `npm start`

Stopping server: `npm stop`

> Using *information_service.sh* requires environment variables: INFORMATION\_SERVICE\_URL, INFORMATION\_SERVICE\_LOGIN, INFORMATION\_SERVICE\_PASSWORD.

> In commands below replace ADDRESS with IP address of your machine.

Registering service in Scalarm Information Service: `./information_service.sh ADDRESS`

Deregistering service in Scalarm Information Service: `./information_service.sh ADDRESS deregister`

API
-------------------
* /status - used to check service avaiability, required only when working with Scalarm Load Balancer
* /panel - returns analysis panel and modals for charts
* /images/:path\_to\_file - returns requested image
* /scripts/:chart_type - shares script file for requested chart type
* /script_tags/:chart_type - returns script tag required for requested chart type
* /chart_instances/:chart_type - returns script for creating requested chart type in accordance with parameters passed as query string