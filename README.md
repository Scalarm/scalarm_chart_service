Scalarm Chart Service
===================

Installation guide
------------------
ściagnąć skrypt (npm, node)?
* curl -sL https://deb.nodesource.com/setup | sudo bash -
* sudo apt-get install -y nodejs
download scalarm_chart_service
wget https://github.com/Scalarm/scalarm_chart_service/archive/master.zip -O scalarm_chart_service.zip && unzip scalarm_chart_service.zip -d scalarm_chart_service/ && rm scalarm_chart_service.zip 
if you prefer using git:
git clone https://github.com/Scalarm/scalarm_chart_service.git
run: npm update && npm install
set proper values in config.js.template & save this file as config.js
set proper values in decoder_configuration.js.template & save hits file as decoder_configuration.js



Other requirements
---------------------
sudo apt-get install build-essential (required for npm to build dependencies)
ruby

Running
-----------------
npm start
npm stop
rejestracja w IS?

API
-------------------
/status
/panel
/images
/main
/scripts
/get
