var request = require('request');
var express = require('express');
var http = require('http');
var async = require('async');

var app = express();
var server = http.createServer(app);

const BASE_URL = 'http://pokeapi.co';
const VERSION = '/api/v1/';


app.get('/', function(req, res){
	var test = {
		ugh: "Jung",
		whoo: "Eunji"
	};

	asyncWaterfall(req.query, res);
	console.log("HTTP GET");
	//res.header('Access-Control-Allow-Origin', 'http://64.71.177.103');
	//res.send(test);
});

app.get('*', function(req, res, next) {
  console.log("Here?");
  var err = new Error();
  err.status = 503;
  next(err);
});

server.listen(8002);
console.log('Express running on %s', server.address().port);

function buildURL(BASE_URL, VERSION, category, option){
	console.log( BASE_URL + VERSION +category  + option);
	return BASE_URL + VERSION + category + option;
} 

function asyncWaterfall(data, res){
	async.waterfall([
	/* *** Function 1 -- Request base stats of Pokemon -- *** */
                function(callback){
			request(buildURL( BASE_URL , VERSION, 'pokemon/' ,data.pokemon), function(err, response, result){
                        	result = JSON.parse(result);
				var baseStats= {};
				//console.log("Response: " + JSON.stringify(responsse) + " " + JSON.stringify(result.sprites[0].resource_uri));
				baseStats['health']   = result.hp;
				baseStats['attack']   = result.attack;
				baseStats['defense']  = result.defense;
				baseStats['spAttack'] = result.sp_atk;
				baseStats['spDefense']= result.sp_def;
				baseStats['speed']    = result.speed;
				baseStats['imageURI'] = result.sprites[0].resource_uri;
				console.log("Base Stats: " + JSON.stringify(baseStats) );
                        	callback(null, data, baseStats);
			});
                },

	/* *** Function 2 -- Request Image of Pokemon -- *** */
                function(data, baseStats, callback){
			request(buildURL( BASE_URL , '', baseStats.imageURI , ''), function(err, response, result){
                        	result = JSON.parse(result);
				data['pokeImage'] = BASE_URL + result.image;
				console.log(result);
                        	callback(null, data, baseStats);
			});
                },
	/* *** Function 3 -- Calculates IVs of Pokemon -- *** */	
		function(data, baseStats, callback){
			var pokemonIV = {};
			pokemonIV['health']    = calculateIV(data.health, baseStats.health, data.level, data.healthEV, 1, false);
			pokemonIV['attack']    = calculateIV(data.attack, baseStats.attack, data.level, data.attackEV, 1, true);
			pokemonIV['defense']   = calculateIV(data.defense, baseStats.defense, data.level, data.defenseEV, 1, true);
			pokemonIV['spAttack']  = calculateIV(data.spAttack, baseStats.spAttack, data.level, data.spAttackEV, 1, true);
			pokemonIV['spDefense'] = calculateIV(data.spDefense, baseStats.spDefense, data.level, data.spDefenseEV, 1, true);
			pokemonIV['speed']     = calculateIV(data.speed, baseStats.speed, data.level, data.speedEV, 1, true);
			pokemonIV['pokeImage'] = data.pokeImage;
			//console.log("Speed: " + calculateIV(data.speed, baseStats.speed, data.level, data.speedEV, 1)); 
			//console.log("Sp Def: " + calculateIV(data.spDefense, baseStats.spDefense, data.level, data.spDefenseEV, 1));

			callback(null, pokemonIV);
		}

                ], function(error, success){
                        console.log("error: " + error);
                        console.log("success: " + JSON.stringify(success));
			if(!error){
		                res.header('Access-Control-Allow-Origin', 'http://64.71.177.103');
                                res.send(success);
                                console.log("Here");
                        }
                        else console.log("Error: " + error);

        });

}

function calculateIV(current, base, level, EV, nature, notHP){
	console.log("Current: " + current + " Base: " + base + " Level : " + level + " EV: " + EV + " Nature: " + nature + " HP: " + notHP);
	if(notHP) return Math.ceil( (current/nature - 5) * 100.0/level - EV/4.0 - 2*base );
	else return Math.ceil( (current - 10) * 100.0/level - EV/4.0 - 2*base - 100 );
}

