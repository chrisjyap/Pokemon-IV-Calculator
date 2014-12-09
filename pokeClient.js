$(document).ready(function(){
        

//        $("#submitButton").attr('id').keypress(function(event) {
 //               if (event.which == 13)  onClickCalculate();
  //      });
});

function onClickCalculate(){
	var data = {};
	var pokemon = $('#pokemonInput').val(); //.replace(/ /g,'-').replace(/\./g,'');
	var level = parseInt($('#lvl').val());
	var health = parseInt($('#hp').val());
	var healthEV= parseInt($('#hpEV').val());
        var attack = parseInt($('#atk').val());
        var attackEV= parseInt($('#atkEV').val());
        var defense = parseInt($('#def').val());
        var defenseEV= parseInt($('#defEV').val());
        var spAttack = parseInt($('#spAtk').val());
        var spAttackEV= parseInt($('#spAtkEV').val());
        var spDefense = parseInt($('#spDef').val());
        var spDefenseEV= parseInt($('#spDefEV').val());
        var speed = parseInt($('#spd').val());
        var speedEV= parseInt($('#spdEV').val());
	
	if( (typeof(pokemon) != 'undefined' && pokemon.length>= 3) && typeNumCheck(level, 1, 99)
			&& typeNumCheck(health, 1, 500) && typeNumCheck(healthEV, 0, 252) 
			&& typeNumCheck(attack, 5, 500) && typeNumCheck(attackEV, 0, 252)
			&& typeNumCheck(defense, 5, 500) && typeNumCheck(defenseEV, 0, 252)
			&& typeNumCheck(spAttack, 10, 500) && typeNumCheck(spAttackEV, 0, 252)
			&& typeNumCheck(spDefense, 20, 500) && typeNumCheck(spDefenseEV, 0, 252)
			&& typeNumCheck(speed, 5, 500) && typeNumCheck(speedEV, 0, 252)){
		
		data['pokemon'] = pokemon;
		data['level'] = level;
		data['health'] = health;
		data['healthEV'] = healthEV;
		data['attack'] = attack;
		data['attackEV'] = attackEV;
		data['defense'] = defense;
		data['defenseEV'] = defenseEV;
		data['spAttack'] = spAttack;
		data['spAttackEV'] = spAttackEV;
		data['spDefense'] = spDefense;
		data['spDefenseEV'] = spDefenseEV;
		data['speed'] = speed;
		data['speedEV'] = speedEV;
		
		$.ajax('http://64.71.177.103:8002', {
			type: 'GET',
			data: data,
			dataType:"json",
			success: function(response){
				console.log(JSON.stringify(response));
			},	
			error: function(req, status, err){
				console.log("Yeah, no. POKEMON", status, err);
			}
		});
	}
	else alert("Fields not set properly!");

	//console.log("Yo: "+ JSON.stringify(data));
}

function typeNumCheck(stat, minStat, maxStat){
	//console.log(typeof(stat) + " : " + stat + " : " + minStat + " : " + maxStat);
	return (typeof(stat) == 'number' && stat >= minStat && stat <=maxStat);
}
