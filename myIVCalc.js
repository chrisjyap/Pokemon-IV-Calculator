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
				data['name']     = result.name;
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
			baseStats = calculateNature(baseStats, data.nature);
			pokemonIV['health']    = calculateIV(data.health, baseStats.health, data.level, data.healthEV, 1, false);
			pokemonIV['attack']    = calculateIV(data.attack, baseStats.attack, data.level, data.attackEV, baseStats.attackNat, true);
			pokemonIV['defense']   = calculateIV(data.defense, baseStats.defense, data.level, data.defenseEV, baseStats.defenseNat, true);
			pokemonIV['spAttack']  = calculateIV(data.spAttack, baseStats.spAttack, data.level, data.spAttackEV, baseStats.spAttackNat, true);
			pokemonIV['spDefense'] = calculateIV(data.spDefense, baseStats.spDefense, data.level, data.spDefenseEV, baseStats.spDefenseNat, true);
			pokemonIV['speed']     = calculateIV(data.speed, baseStats.speed, data.level, data.speedEV, baseStats.speedNat, true);
			pokemonIV['pokeImage'] = data.pokeImage;
			pokemonIV['name']      = data.name;
			//console.log("Speed: " + calculateIV(data.speed, baseStats.speed, data.level, data.speedEV, 1)); 
			//console.log("Sp Def: " + calculateIV(data.spDefense, baseStats.spDefense, data.level, data.spDefenseEV, 1));

			callback(null, pokemonIV);
		}

                ], function(error, success){
                        console.log("error: " + error);
                        console.log("success: " + JSON.stringify(success));
			if(!error){
		                res.header('Access-Control-Allow-Origin', 'http://chrisyap.lab.he.net');
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

function calculateNature(baseStats, nature){
	baseStats['attackNat'] = 1;
	baseStats['defenseNat'] = 1;
	baseStats['spAttackNat'] = 1;
	baseStats['spDefenseNat'] = 1;
	baseStats['speedNat'] = 1;
	switch(nature){
		case 'lonely':
			baseStats.attackNat = 1.1;
			baseStats.defenseNat= .9;
			break;
		case 'brave':
                        baseStats.attackNat = 1.1;
                        baseStats.speedNat= .9;
                        break;
		case 'adamant':
                        baseStats.attackNat = 1.1;
                        baseStats.spAttackNat= .9;
                        break;
		case 'naughty':
                        baseStats.attackNat = 1.1;
                        baseStats.spDefenseNat= .9;
                        break;
		case 'bold':
                        baseStats.defenseNat = 1.1;
                        baseStats.attackNat= .9;
                        break;
                case 'relaxed':
                        baseStats.defenseNat = 1.1;
                        baseStats.speedNat= .9;
                        break;
                case 'impish':
                        baseStats.defenseNat = 1.1;
                        baseStats.spAttackNat= .9;
                        break;
                case 'lax':
                        baseStats.defenseNat = 1.1;
                        baseStats.spDefenseNat= .9;
                        break;
                case 'timid':
                        baseStats.speedNat = 1.1;
                        baseStats.attackNat= .9;
                        break;
                case 'hasty':
                        baseStats.speedNat = 1.1;
                        baseStats.defenseNat= .9;
                        break;
                case 'jolly':
                        baseStats.speedNat = 1.1;
                        baseStats.spAttackNat= .9;
                        break;
                case 'naive':
                        baseStats.speedNat = 1.1;
                        baseStats.spDefenseNat= .9;
                        break;
                case 'modest':
                        baseStats.spAttackNat = 1.1;
                        baseStats.attackNat= .9;
                        break;
                case 'mild':
                        baseStats.spAttackNat = 1.1;
                        baseStats.defenseNat= .9;
                        break;
                case 'quiet':
                        baseStats.spAttackNat = 1.1;
                        baseStats.speedNat= .9;
                        break;
                case 'rash':
                        baseStats.spAttackNat = 1.1;
                        baseStats.spDefenseNat= .9;
                        break;
                case 'calm':
                        baseStats.spDefenseNat = 1.1;
                        baseStats.attackNat= .9;
                        break;
                case 'gentle':
                        baseStats.spDefenseNat = 1.1;
                        baseStats.defenseNat= .9;
                        break;
                case 'sassy':
                        baseStats.spDefenseNat = 1.1;
                        baseStats.speedNat= .9;
                        break;
                case 'careful':
                        baseStats.spDefenseNat = 1.1;
                        baseStats.spAttackNat= .9;
                        break;
		default:
	}
	return baseStats;
}
