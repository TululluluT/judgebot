const rp = require("request-promise-native");
const _ = require("lodash");
const Discord = require("discord.js");

class Standard{

    constructor() {
        this.api = "http://whatsinstandard.com/api/4/sets.json";
        this.commands = ["standard"];
        this.cachedEmbed = null;
        this.cachedTime = null;
        this.cacheExpireTime = 24*60*60*1000; //day in milliseconds
        this.loadList()
    }

    getCommands(){
        return this.commands;
    }

    generateEmbed(setList){
        const currentDate = new Date();
        const removedFutureSetList = setList.filter(set=>{
            const releaseDate = new Date(set.enter_date);
            return currentDate.getTime()>=releaseDate.getTime();
        });
        const groupedSetList = _.groupBy(removedFutureSetList,'rough_exit_date');
        let description = "";
        _.forEach(groupedSetList,(value,key)=>{
           description += '*Rotates '+key+':*```'+value.map(set=>set.name).join(' | ')+'```\n';
        });
        const embed = new Discord.RichEmbed({
            title: "Currently in Standard",
            url:"http://whatsinstandard.com/",
            description
        });
        this.cachedEmbed=embed;
        this.cachedTime=currentDate.getTime();
        return embed;
    }

    loadList(){
        rp({url: this.api, json:true}).then(body=>{
            return this.generateEmbed(body);
        },err=>{
            log.error("Error getting Standard list",err.error.details);
            return new Discord.RichEmbed({
                title: "Standard - Error",
                description: "Couldn't create Standard list.",
                color: 0xff0000
            });
        });
    }

    handleMessage(command, parameter, msg) {
        if(this.cachedEmbed != null && this.cachedTime != null && new Date().getTime()-this.cachedTime<this.cacheExpireTime){
            return msg.channel.send('',{embed: this.cachedEmbed});
        }
        return msg.channel.send('',{embed: this.loadList()});
    }
}

module.exports = Standard;