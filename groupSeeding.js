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
  const matchedGroups = [];
  console.log('minTeamsInGroup: ' + minTeamsInGroup);

  groups.forEach(group => {
    matchedGroups.push({
      id: group.id,
      teams: []
    });

    if (group.teams.length === minTeamsInGroup) {
      // console.log('Min number of teams per group');
      group.teams.forEach(teamName => {
        const team = {
          name: teamName,
          teamsFaced: group.teams.filter(name => name !== teamName)
        };
        matchedGroups[group.id].teams.push(team);
      });
    } else {
      // console.log('Not the min number of teams per group');
      let teamLookUp = {}
      group.teams.forEach((teamName, i) => {
        matchedGroups[group.id].teams.push({name: teamName, teamsFaced: []});
        teamLookUp[teamName] = i;
      });

      // console.log(matchedGroups[group.id]);
      // console.log(teamLookUp);

      group.teams.forEach((teamA, i) => {
        const potentialMatch = group.teams.filter(name => name !== teamA);
        console.log('+-----------------------------------------------------------------+');
        console.log('| Pairings for team: ' + teamA);
        console.log('+-----------------------------------------------------------------+');
        potentialMatch.forEach(teamB => {
          console.log('| Number of matches: ' + matchedGroups[group.id].teams[i].teamsFaced.length);
          const isTeamFaced = matchedGroups[group.id].teams[i].teamsFaced.includes(teamB);
          const teamAMaxedMatches = matchedGroups[group.id].teams[i].teamsFaced.length < (minTeamsInGroup - 1);
          const teamBMaxedMatches = matchedGroups[group.id].teams[teamLookUp[teamB]].teamsFaced.length < (minTeamsInGroup - 1);

          if (!isTeamFaced && teamAMaxedMatches && teamBMaxedMatches) {
            matchedGroups[group.id].teams[i].teamsFaced.push(teamB);
            matchedGroups[group.id].teams[teamLookUp[teamB]].teamsFaced.push(teamA);
          }
        });
        console.log('\n');
      });



    }
  });

  // console.log(JSON.stringify(matchedGroups, null, 2));
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
