//倉庫番　(c)tane 2016/06/15
//倉庫ゲームのフィールドに出てくる物体のスーパークラス
var SokoObject = function(argSokoObjArray, argSokoMap, arglocation){
	this.sokoObjArray = argSokoObjArray;
    this.sokoMap = argSokoMap;
	this.setlocation(arglocation);
    this.whatobject = 'SokoObject'
    this.character = '';
};
SokoObject.prototype = {
move : function(argNewlocation) {
	//オブジェクトを移動させる処理
	var newlocation = argNewlocation;
	var oldlocation = this.getlocation();
	var myindex = this.sokoMap.getindex(oldlocation);

	this.sokoMap.setindex(oldlocation, false);
	this.sokoMap.setindex(newlocation, myindex);
	this.setlocation(newlocation);
	return oldlocation;
},
pushObject : function(argdLocation, argWeight) {
	//オブジェクトを押す処理。その結果移動できるかどうか決まる。
	//移動できたら真を返す。
	var weight = argWeight;
	//もし荷物が連なっていたら重いので動かない。
	if(weight >= 2){
		return false;
	}
	//移動のために、物体が押された処理
	var dlocation = argdLocation;
	var nowlocation = this.getlocation();
	var nextlocation = addArrayMatrix(nowlocation,dlocation);
	var nextObjIndex = this.sokoMap.getindex(nextlocation);
	if(nextObjIndex==false){
		//隣は床か目的地なので移動可能
		//移動の処理
		this.move(nextlocation);
		return true;
	}
	//もしとなりの物体が目的地にいたら移動不可。
	if(this.sokoMap.isDestination(nextlocation)){
		return false;
	}
	//となりの物体を押す
	var canmove = this.sokoObjArray[nextObjIndex].pushObject(dlocation, ++weight);
	//戻り値が真なら移動できる。
	if(canmove){
		//移動の処理
		this.move(nextlocation);
		return true;
	}
	return false;
},
setlocation : function(argNewlocation){
	this._location = argNewlocation;
},
getlocation : function(){
    return this._location;
}
};


//壁
var Wall = function(){
    SokoObject.apply(this, arguments);
    this.whatobject = 'Wall';
    this.character = '#';
};
Wall.prototype = Object.create(SokoObject.prototype);
Wall.prototype.pushObject = function(argdLocation, argWeight){
	//壁なので押されても動かない
	return false;
};

//プレーヤー
var Player = function(){
    //プレーヤーが倉庫の上に乗るとキャラクタ表示が変更になる。
    SokoObject.apply(this, arguments);
    this.whatobject = 'Player';
    this.character = 'p';
    this.characterOnTheDestination = 'P';
};
Player.prototype = Object.create(SokoObject.prototype);

//荷物
var Baggage = function(){
    //荷物が倉庫に入るとキャラクタ表示が変更になり、動かなくなる。
    SokoObject.apply(this, arguments);
    this.whatobject = 'Baggage';
    this.character = 'o';
    this.characterOnTheDestination = 'O';
};
Baggage.prototype = Object.create(SokoObject.prototype);


var SokoMap = function(argMapArray){
    //マップの作成
    this.lengthY = argMapArray.length;
    this.lengthX = argMapArray[this.lengthY-1].length;

    this._objectMap = new Array();
    for (var i=0; i < this.lengthY; i++){
        this._objectMap[i] = new Array();
    }
    for (var i=0; i < this.lengthY; i++){
        for (var j=0; j < this.lengthX; j++){
            this._objectMap[i][j] = new Array();
        }
    }
};
SokoMap.prototype = {
setindex : function(arglocation, argIdx){
	var ix = arglocation.X;
	var iy = arglocation.Y;
	if (isFinite(argIdx)) {
		this._objectMap[iy][ix].sokoObjectIndex = argIdx;
	} else {
		this._objectMap[iy][ix].sokoObjectIndex = false;
	}
},
getindex : function(arglocation){
	var ix = arglocation.X;
	var iy = arglocation.Y;
	return this._objectMap[iy][ix].sokoObjectIndex;
},
setDestination : function(arglocation, argValue){
	this._objectMap[arglocation.Y][arglocation.X]._isDestination = argValue;

},
isDestination : function(arglocation){
	return this._objectMap[arglocation.Y][arglocation.X]._isDestination;
}
};


var Field = function(argMap){
    this.sokoObjArray = new Array();
    this.sokoMap = new SokoMap(argMap)

	//倉庫オブジェクトを生成し、配列に格納する
	//倉庫ゲームのマップ上にオブジェクト情報を書き込む
	var sokoindex = 0;
    for(var iy=0; iy < this.sokoMap.lengthY; iy++){
        for(var ix=0; ix < this.sokoMap.lengthX; ix++){
        	var location = {X:ix, Y:iy};
            switch (argMap[iy][ix]){
            case 'w':
                this.sokoObjArray.push(new Wall(this.sokoObjArray, this.sokoMap, location));
                this.sokoMap.setindex(location, sokoindex);
                this.sokoMap.setDestination(location, false);
                sokoindex++;
                break;
            case 'p':
                this.sokoObjArray.push(new Player(this.sokoObjArray, this.sokoMap, location));
                this.sokoMap.setindex(location, sokoindex);
                this.sokoMap.setDestination(location, false);
                this._setPindex(sokoindex);
                sokoindex++;
                break;
            case 'b':
                this.sokoObjArray.push(new Baggage(this.sokoObjArray, this.sokoMap, location));
                this.sokoMap.setindex(location, sokoindex);
                this.sokoMap.setDestination(location, false);
                sokoindex++;
                break;
            case 'd':
                this.sokoMap.setindex(location, false);
                this.sokoMap.setDestination(location, true);
                break;
            default:
                this.sokoMap.setindex(location, false);
                this.sokoMap.setDestination(location, false);
                break;
            }
        }
    }
};
Field.prototype = {
display : function(){
    var maptxt = '';
    var nokori = 0;
    for(var iy=0; iy < this.sokoMap.lengthY; iy++){
        for(var ix=0; ix < this.sokoMap.lengthX; ix++){
        	var location = {X:ix, Y:iy};
        	var sokoindex = this.sokoMap.getindex(location);
        	if (sokoindex===false) {
           		//目的地か床の絵を出力する
           		if (this.sokoMap.isDestination(location)){
           			maptxt += '.';
           			nokori++;
           		} else {
           			maptxt += ' ';
           		}
           	} else {
        		//オブジェクトの絵を出力する
	            if (this.sokoMap.isDestination(location)){
    	            maptxt += this.sokoObjArray[sokoindex].characterOnTheDestination;
    	            if(this.sokoObjArray[sokoindex].whatobject=='Player'){
    	            	//目的地上のものがプレーヤーなら荷物の残り数を加算する。
    	            	nokori++;
    	            }
        	    } else {
            	    maptxt += this.sokoObjArray[sokoindex].character;
           		}
           	}
        }
        maptxt += '\n';
    }
    console.log(maptxt);
    return nokori;
},
_setPindex : function(argIndex){
	this._pindex = argIndex;
},
_getPindex : function(){
	return this._pindex;
},
pmove : function(argDirection){
	var pindex = this._getPindex();
	var dlocation = new Array();
	switch(argDirection){
	case 'u':
		dlocation = {X:0, Y:-1};
		break;
	case 'd':
		dlocation = {X:0, Y:1};
		break;
	case 'r':
		dlocation = {X:1, Y:0};
		break;
	case 'l':
		dlocation = {X:-1, Y:0};
		break;
	default:
		return false;
		break;
	}
	var weight = 0;
	this.sokoObjArray[pindex].pushObject(dlocation, weight);
}
};


var addArrayMatrix = function(array1, array2){
	var ans = new Array()
	for (i in array1){
		ans[i] = array1[i] + array2[i];
	}
	return ans;
}


var main = function(){
    var map1 = new Array(
        ['w','w','w','w','w','w','w','w','w'],
        ['w',' ','d',' ',' ',' ',' ',' ','w'],
        ['w',' ','w',' ','b','d',' ',' ','w'],
        ['w',' ','w',' ','w','w',' ',' ','w'],
        ['w',' ','b',' ','w','w',' ',' ','w'],
        ['w',' ','w',' ','w','w',' ',' ','w'],
        ['w',' ',' ',' ',' ',' ','p',' ','w'],
        ['w','w','w','w','w','w','w','w','w']);

    var field = new Field(map1);
    field.display();
    console.log();
	console.log('ゲーム終了は x キーを押してください');
    console.log();

	//キー入力イベントトリガ
    var stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    stdin.on('data', function(chunk){
        var inputchar;
        // ctrl-c: end of text
        if (chunk === '\u0003' || chunk == 'x' || chunk == 'X') {
            process.exit();
        }
//        process.stdout.write('Get Chunk: ' + chunk +'\n');
        if (chunk.charCodeAt(0) == 27 && chunk.charCodeAt(1) == 91){
            switch (chunk.charCodeAt(2)){
                case 65:
                    inputchar = 'u';
                    break;
                case 66:
                    inputchar = 'd';
                    break;
                case 67:
                    inputchar = 'r';
                    break;
                case 68:
                    inputchar = 'l';
                    break;
                default:
                    inputchar = ' ';
                    break;
            }
        } else {
            inputchar = chunk.substring(0,1);
        }
//        console.log('input:' + inputchar);
		field.pmove(inputchar);
		var nokori = field.display();
		if (nokori==0){
			console.log('おつかれ様です。配達完了です！');
			console.log();
			console.log();
			process.exit();
		} else {
			console.log('荷物の残り、あと' + nokori + '個です。');
			console.log('ゲーム終了は x キーを押してください');
			console.log();
		}
    });

};


main();
