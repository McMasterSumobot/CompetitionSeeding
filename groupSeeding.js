// based on number of teams, find best number of groups
// randomly put teams from list into different groups
// based on the smallest group size, determine the number of matches each team will play
// create game match ups between teams in each group

fs = require('fs');
const pathToTeamList = './teamList.txt'; // each teams should be on it's own line, no empty lines!
const outputFile = './Groups.csv';

function getTeamListFromTextFile(pathToTeamList) {
  return new Promise((fulfill, reject) => {
    fs.readFile(pathToTeamList, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        reject();
      }
      fulfill(data.split(/\r?\n/));
    });
  });
}

function createMatchUps(groups, minTeamsInGroup) {
  groups.forEach(group => {
    if (group.teams.length === minTeamsInGroup) {
      console.log('Min number of teams per group');
      group.teams.forEach(team => {
        team.matches = group.teamNames.filter(name => name !== team.name);
      })
    } else {
      console.log('Not the min number of teams per group');
      

      group.teams.forEach(team => {
        // matches === minTeamsInGroup - 1;
        
      });



    }
  });

  // console.log(JSON.stringify(groups, null, 2));
}

// this list is of team objects
function createGroups(teamList) {
  let numberOfGroups;

  if (teamList.length < 20) {
    // 1-4 groups with min group size === 5
    numberOfGroups = Math.floor(teamList.length / 5);
  } else if (teamList.length <= 1000) {
    // 4 groups spread em out
    numberOfGroups = 4;
  }

  const minTeamsInGroup = Math.floor(teamList.length / numberOfGroups);
  let currentGroup = 0;
  const groups = [];

  for(let i = 0; i < numberOfGroups; i++) {
    groups.push({
      id: i,
      teams: [],
      teamNames: []
    });
  }

  teamList.forEach(teamName => {
    groups[currentGroup].teams.push({
      name: teamName,
      matches: [] // list of teams they play, can get the count from this
    });
    groups[currentGroup].teamNames.push(teamName);
    currentGroup++;
    if (currentGroup >= numberOfGroups) {
      currentGroup = 0;
    }
  });

  createMatchUps(groups, minTeamsInGroup);
}




getTeamListFromTextFile(pathToTeamList).then(teamList => {
  createGroups(teamList);
});
