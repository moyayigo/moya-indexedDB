/********************************************************************/
/***  moya-indexedDB v2 by moyayigo 893574354@qq.com  2021-09-28  ***/
/********************************************************************/
class moyaindexedDB {
	constructor(dbName, mainstore) {
        this.dbName = dbName;//数据库名称
        this.mainstore = mainstore;//初始仓库 
		this.dbExists = true;//判断数据库是否存在
		console.log('hello moyaindexedDB!');
    }
 /*启动indexedDB*/   
	indexedDBstart() {
		this.dbcheck(this.dbName);
		if(this.dbExists == false){
			this.dbinit(1);//使用dbinit(1)首次初始化后，使用dbinit()常规实例化数据库
		}else{
			this.dbinit();//常规实例化数据库
		}
		this.dbExists = true;//每次调用dbcheck()检测完后需重置为true
	}
/*检测数据库是否存在*/
	dbcheck(name) {
		var request = indexedDB.open(name);
		request.onupgradeneeded = function (event){
			event.target.transaction.abort();
			this.dbExists = false;
			console.log(name+' indexeddb not exist!');
		}
	}
/*数据库初始化*/
	//初始化过程将创建dbNAme的数据库和mainstore的仓库
	//如果数据库和仓库均已存在将对其进行实例化
	dbinit(ver='',dbname=this.dbName,dbstore=this.mainstore) {
		if(ver){
			var request = indexedDB.open(dbname, ver);
		}else{
			var request = indexedDB.open(dbname);
		}
		request.onerror = function (event) {
			console.error("DB error:", event.target.errorCode || event.target.error);
		}
		request.onupgradeneeded = function(event) {
			let db = event.target.result;
			let objectStore = db.createObjectStore(dbstore);
			objectStore.transaction.oncomplete = function(event) {
				console.log(dbstore+' datastore create success!');
			}
		}
		request.onsuccess = function (event) {
			let db = event.target.result;
			console.log('indexeddb start!');
		}
	}
/*创建仓库*/
	// 创建仓库一定要升级版本值version(>现有版本)
	// 该函数创建仓库将对数据库版本自动加1
	// 支持创建单索引index
	createInstanceStore(store,auto=false,index='',dbname=this.dbName) {
		var request = indexedDB.open(dbname);
		request.onsuccess = function (event) {
			let db = event.target.result;
			let currentVer = db.version;//获取当前db版本
			db.close();//创建仓库前要先关闭当前数据库连接
			console.log('indexeddb closed!version:'+currentVer);
			var newrequest = indexedDB.open(dbname, currentVer+1);
			newrequest.onupgradeneeded = function (event) {
				let db = event.target.result;
				if(auto){
					var objStore = db.createObjectStore(store, { keyPath:'id',autoIncrement : true });
				}else{
					var objStore = db.createObjectStore(store);
				}
				if(index){
					objStore.createIndex(index, index, {unique: true});
				}
				objStore.transaction.oncomplete = function(event) {
					console.log(store+' datastore create success!');
				}
				db.close();
			};
		}
	}
/*写入数据*/
	//当val不为空时，obj参数为键名，否则以存储对象方式写入数据
	add(store,obj,val='',dbname=this.dbName) {
		var request = indexedDB.open(dbname);
		request.onsuccess = function (event) {
			let db = event.target.result;
			if(val){
				var requests = db.transaction(store, 'readwrite').objectStore(store).add(val,obj);
			}else{
				var requests = db.transaction(store, 'readwrite').objectStore(store).add(obj);
			}
			requests.onsuccess = function (event) {
				console.log('write data success!');
			}
		}
		
	}
/*读取一个键的值*/
	// 存储键值、对象的key各不相同，前者一般为键名字符串，后者为缺省id值，起始为1
	read(store,key,dbname=this.dbName) {
		var request = indexedDB.open(dbname);
		request.onsuccess = function (event) {
			let db = event.target.result;
			db.transaction(store).objectStore(store).get(key).onsuccess = function(event) {
				//cacheMessage = event.target.result;
				//VueMethods(event.target.result);
				console.log(event.target.result);
			};
		}
		
	}
/*以存储对象的方式更新数据*/
	update_OBJ(store,key,newobj,keymap,dbname=this.dbName) {
		var request = indexedDB.open(dbname);
		request.onsuccess = function (event) {
			let db = event.target.result;
			var objectStore = db.transaction(store, 'readwrite').objectStore(store);
			objectStore.get(key).onsuccess = function(event) {
				let data = event.target.result;
				keymap.forEach(function(item,index){
					data[item] = newobj[item];
				})
				objectStore.put(data).onsuccess = function(event) {
					console.log("Update success!");
				}
			};
		}
		
	}
/*以键值对的方式更新数据*/
	update_KV(store,key,newdata,dbname=this.dbName) {
		var request = indexedDB.open(dbname);
		request.onsuccess = function (event) {
			let db = event.target.result;
			var objectStore = db.transaction(store, 'readwrite').objectStore(store);
			objectStore.put(newdata,key).onsuccess = function(event) {
				console.log("Update success!");
			};
		}
		
	}
/*以键值对的方式读取所有数据*/
	readAll(store,dbname=this.dbName) {
		var request = indexedDB.open(dbname);
		request.onsuccess = function (event) {
			let db = event.target.result;
			var objectStore = db.transaction(store).objectStore(store);
			objectStore.openCursor().onsuccess = function(event) {
				let cursor = event.target.result;
				if (cursor) {
					//cacheMessagelist.push([cursor.key,cursor.value]);
					//VueMethods([cursor.key,cursor.value]);
					console.log(cursor.key+' : '+cursor.value+'\r');
					cursor.continue();
				}else {
					console.log("No more entries!");
				}
			};
		}
		
	}
/*一次性读取所有数据*/
	readAllonce(store,dbname=this.dbName) {
		var request = indexedDB.open(dbname);
		request.onsuccess = function (event) {
			let db = event.target.result;
			var objectStore = db.transaction(store).objectStore(store);
			objectStore.getAll().onsuccess = function(event) {
				//cacheMessagelist = event.target.result;
				//VueMethods(event.target.result);
				console.log(event.target.result);
			};
		}
		
	}
/*统计仓库记录总数*/
	count(store,dbname=this.dbName) {
		var request = indexedDB.open(dbname);
		request.onsuccess = function (event) {
			let db = event.target.result;
			var objectStore = db.transaction(store).objectStore(store);
			objectStore.count().onsuccess = function(event) {
				//cacheTotal = event.target.result;
				console.log(event.target.result);
			};
		}
		
	}
/*获取仓库名列表*/	
	readstore(dbname=this.dbName) {
		var request = indexedDB.open(dbname);
		request.onsuccess = function (event) {
			let db = event.target.result;
			let Storelist = Array.from(db.objectStoreNames);
			//cacheStorelist.forEach(function(item){
			//	cacheStorelistnew.push(item);
			//});
			console.log(Storelist);
		}
	}

}