# moya-indexedDB

#### Introduction

A simple and useful indexedDB class.

#### Install

```
npm i moya-indexedDB
```

#### Usage

```js
const mydb = new moyaindexedDB('moyadb','app');
mydb.indexedDBstart();

//OR VUE Project

/* eslint-disable no-unused-vars */
import moyaindexedDB from "moya-indexedDB";
const mydb = new moyaindexedDB('moyadb','app');
mydb.indexedDBstart();
```

#### Demo

```js
mydb.add("app","mykey",1);//write in key,value
mydb.add("app","mykey",1);//read key,value
mydb.createInstanceStore("objstore",true,'index');//create a object store
mydb.add("objstore",{'index':1,'name':'Niek'});//write in object
mydb.read("objstore",1);//read object
```

