// based on number of teams, find best number of groups
// randomly put teams from list into different groups
// based on the smallest group size, determine the number of matches each team will play
// create game match ups between teams in each group

fs = require('fs');
const pathToTeamList = './teamList.txt'; // each teams should be on it's own line, no empty lines!
const outputFile = './Groups.csv';

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

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

function removeExtraGroups(matchedGroups, groupLookup, minTeamsInGroup) {
  for (let i = 0; i < matchedGroups[group.id].teams.length; i++) {
    const team = matchedGroups[group.id].teams[i];

    if(team.teamsFaced.length >= minTeamsInGroup) {
      const indexA = getRandomInt(team.teamsFaced.length);
      const teamToRemove = team.teamsFaced[indexA];
      const indexB = matchedGroups[group.id].teams[groupLookup[teamToRemove]].teamsFaced.indexOf(team.name);

      if (matchedGroups[group.id].teams[groupLookup[teamToRemove]].teamsFaced.length >= minTeamsInGroup) {
        matchedGroups[group.id].teams[i].teamsFaced.splice(indexA, 1);
        matchedGroups[group.id].teams[groupLookup[teamToRemove]].teamsFaced.splice(indexB, 1);
      }

    }
  }
  return matchedGroups;
}

function createMatchUps(groups, minTeamsInGroup) {
  const matchedGroups = [];

  groups.forEach(group => {
    matchedGroups.push({
      id: group.id,
      teams: []
    });

    let groupLookup = {};

    group.teams.forEach((teamName, i) => {
      const team = {
        name: teamName,
        teamsFaced: group.teams.filter(name => name !== teamName)
      };
      groupLookup[teamName] = i;
      matchedGroups[group.id].teams.push(team);
    });

    while (tooManyMatches(matchedGroups)) {

    }

    matchedGroups = removeExtraGroups(matchedGroups, groupLookup, minTeamsInGroup);

  });

  console.log(JSON.stringify(matchedGroups, null, 2));
}

// this list is of team objects
function createGroups(teamList) {
  let numberOfGroups;

  numberOfGroups = 4;
  // if (teamList.length < 20) {
  //   // 1-4 groups with min group size === 5
  //   numberOfGroups = Math.floor(teamList.length / 5);
  // } else if (teamList.length <= 1000) {
  //   // 4 groups spread em out
  //   numberOfGroups = 4;
  // }

  const minTeamsInGroup = Math.floor(teamList.length / numberOfGroups);
  let currentGroup = 0;
  const groups = [];

  for(let i = 0; i < numberOfGroups; i++) {
    groups.push({
      id: i,
      teams: []
    });
  }

  teamList.forEach(teamName => {
    groups[currentGroup].teams.push(teamName);
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
