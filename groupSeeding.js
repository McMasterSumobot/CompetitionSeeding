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

function createAllMatchUps(groups) {
  for (let i = 0; i < groups.length; i++) {
    let group = groups[i];
    let teams = group.teams;
    let matchId = 0;

    teams.forEach(teamA => {
      teams.forEach(teamB => {
        if (teamA !== teamB) {

          if (group.matches.length === 0) {
            group.matches.push({id: matchId, teams: [teamA, teamB]});
            group[teamA]++;
            group[teamB]++;
          } else {
            let matchAlreadyExists = false;
            group.matches.forEach(match => {
              if (teamA === match.teams[0] && teamB === match.teams[1]) {
                matchAlreadyExists = true;
              }
              if (teamA === match.teams[1] && teamB === match.teams[0]) {
                matchAlreadyExists = true;
              }
            });

            if (!matchAlreadyExists) {
              group.matches.push({id: matchId, teams: [teamA, teamB]});
              group[teamA]++;
              group[teamB]++;
            }
          }
        }
      });
    });
  }
  return groups;
}

function removeExtraMatches(groups, matchesPerGroup) {
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const teamNames = group.teams;
    let correctNumberOfMatches = true;
    teamNames.forEach(name => {
      if (group[name] > matchesPerGroup) {
        correctNumberOfMatches = false;
      }
    });

    if (!correctNumberOfMatches) {
      console.log('Too many matches!');
    }
  }

  return groups;
}

getTeamListFromTextFile(pathToTeamList).then(teamList => {
  const numberOfGroups = 4;
  const matchesPerGroup = Math.floor(teamList.length / numberOfGroups) - 1;
  
  let groups = [];

  for(let i = 0; i < numberOfGroups; i++) {
    groups.push({
      id: i,
      matches: [],
      teams: []
    });
  }

  let currentGroup = 0;
  teamList.forEach(teamName => {
    groups[currentGroup][teamName] = 0;
    groups[currentGroup].teams.push(teamName);
    currentGroup++;
    if (currentGroup >= numberOfGroups) {
      currentGroup = 0;
    }
  });

  groups = createAllMatchUps(groups);
  groups = removeExtraMatches(groups, matchesPerGroup);

  // console.log(JSON.stringify(groups, null, 2));
});
