///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
//require
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
require("node.class");
var fs = require("fs");
var pathMod = require("path");
require("utils/FileFolder.js");
//require(process.env.lib+"/werm/js/utils/StringUtil.js");
var chokidar = require('chokidar');
var proxy = require('nodeproxy');
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
//class setup
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
global.Entry_stc = Class.extend({
	///////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////
	//static 
	///////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////
	server_CHK:function(arr) {
		if (debug && server) {
			arr.push(
				//'webpack-dev-server/client?'+process.env.HOST+'/dev_server/'+port,
				'webpack-dev-server/client?/dev_server/'+port,
				'webpack/hot/only-dev-server'
			);
		}
		//console.log(arr);
		return arr;
	},
	///////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////
	//init var
	///////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////
	watcher:undefined,
	//exiting:false,
	go:function(dir) {
		//------------------------------------------------------
		//init var
		//------------------------------------------------------
		var files;
		var file;
		var entries = {};
		var result = [];
		var markup;
		var watcher;
		var hadMarkup = [];
		var is_dir;
		var cacheFile;
		//------------------------------------------------------
		if (!dir) {
			dir = process.env.app_root+"/resources/views";
		}
		//------------------------------------------------------
		require('child_process').exec("chown -R apache:apache "+process.env.temp, function(err) {
			if (err != null) {
				console.log(err);
			}
		});
		//------------------------------------------------------
		if (fs.existsSync(dir)) {
			files = fs.readdirSync(dir);
			//------------------------------------------------------
			for (var i = 0; i < files.length; i++) {
				result = [];
				if (FileFolder.is_dir(dir+"/"+files[i])) {
					cacheFile = dir+"/"+files[i]+"/"+files[i]+".cache.entry.js"
					if (!fs.existsSync(cacheFile)) {
						FileFolder.writeFileSync(cacheFile);
					}
					result = this.getEntry(dir+"/"+files[i]);
					markup = this.markup_CHK(result, files[i]);
					hadMarkup = hadMarkup.concat(markup.hadMarkup);
					result = markup.result;
					//	if (!is_dir) {
							//(result).push(file);
					//	}
					//console.log(result);
					entries[files[i]] = result;
				}
			}
			//------------------------------------------------------
			if (server) {
				if (this.watcher == undefined) {
					this.watcher = chokidar.watch(hadMarkup);
					this.watcher.on('change', proxy(this.onChange_handler, this));
				} else {
					this.watcher.add(hadMarkup);
				}
			}
		} else {
			var entryname = (a = GenFun.getArg("--entryname")) ? a : "home";
			dir = process.env.app_root;
			if (!fs.existsSync(cacheFile)) {
				FileFolder.writeFileSync(cacheFile = dir+"/.cache.entry.js");
			}
			result = this.getEntry(dir);
			//markup = this.markup_CHK(result, entryname);
			//hadMarkup = hadMarkup.concat(markup.hadMarkup);
			//result = markup.result;
			//	if (!is_dir) {
					//(result).push(file);
			//	}
			//console.log(result);
			entries[entryname] = result;
		}
		//--------------------------------------
		//console.log(process.env.debug);
		/*if (process.env.devserver == "true" || process.env.devserver == true) {
			entries.cp = this.server_CHK([process.env.production+"/controllerpanel/apps/cpStartUp/entry.js"]);
		}*/
		//--------------------------------------
		return entries;
	},
	//-------------------------------------------------------------------------------------
	markup_CHK:function(result, id) {
		var	markup = FileFolder.replaceMarkupWrite(result, {"folder":id}, id);
		return markup;
	},
	//-------------------------------------------------------------------------------------
	getEntry:function(dir) {
		result = [];
		//if (fs.existsSync(dir+"/"+files[i]+"/entry.js")) {
			//file = dir+"/"+files[i]+"/entry.js";
		//}
		if (FileFolder.is_dir(dir)) {
			result = FileFolder.find(dir, ["*.entry.js", "entry.werm.js"], result);
			//markup = FileFolder.replaceMarkupWrite(result, {"folder":files[i]}, files[i]);
		//	if (!is_dir) {
				//(result).push(file);
		//	}
			//console.log(result);
			result = this.server_CHK(result);
			if (GenFun.getArg("--nodefault") == undefined) result.unshift(process.env.uber_src+"/default_import.js");
			//hadMarkup = hadMarkup.concat(markup.hadMarkup);
		}
		return result;
	},
	//-------------------------------------------------------------------------------------
	onChange_handler:function(e) {
		console.log(e);
		setInterval(function() {
			Entry.go();
			clearInterval(this);
			console.log('sdfljh');
		}, 200);
	}
});
global.Entry = new Entry_stc();