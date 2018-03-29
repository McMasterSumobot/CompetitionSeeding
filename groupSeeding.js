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

    teams.forEach(teamA => {
      teams.forEach(teamB => {
        if (teamA !== teamB) {

          if (group.matches.length === 0) {
            group.matches.push({teams: [teamA, teamB]});
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
              group.matches.push({teams: [teamA, teamB]});
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

function hasExtraMatches(group, matchesPerGroup) {
  const teamNames = group.teams;
  let extraCount = 0;

  teamNames.forEach(name => {
    if (group[name] > matchesPerGroup) {
      extraCount++;
    }
  });
  return extraCount > 1;
}

function removeExtraMatches(groups, matchesPerGroup) {
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    // todo: replace this with a while check
    if (hasExtraMatches(group, matchesPerGroup)) {
      // console.log('Too many matches!');

      group.teams.forEach(teamA => {
        group.teams.forEach(teamB => {
          if (teamA !== teamB) {
            if (group[teamA] > matchesPerGroup && group[teamB] > matchesPerGroup) {
              // check if the two have a match together and remove it
              let matchIndex = -1;
              group.matches.forEach((match, i) => {
                if (teamA === match.teams[0] && teamB === match.teams[1]) {
                  matchIndex = i;
                }
                if (teamA === match.teams[1] && teamB === match.teams[0]) {
                  matchIndex = i;
                }
              });

              if (matchIndex !== -1) {
                group.matches.splice(matchIndex, 1);
                group[teamA]--;
                group[teamB]--;
              }
            }
          }
        });
      });




    }
  }

  return groups;
}

function exportToCsv(groups) {
  const csvLines = [];

  let headerLine = '';
  for(let i = 0; i < groups.length; i++) {
    headerLine = `${headerLine}Group ${i},Results,,`;
  }
  csvLines.push(headerLine);

  let generatedAllMatches = false;
  let groupCheckList = [];
  let matchIndex = 0;

  groups.forEach(() => {
    groupCheckList.push(false);
  });

  while(!generatedAllMatches) {
    let matchRow = '';

    for (let i = 0; i < groups.length; i++) {
      const matches = groups[i].matches;
      if (matchIndex < matches.length) {
        matchRow = `${matchRow}${matches[matchIndex].teams[0]} vs ${matches[matchIndex].teams[1]},,,`;
      } else {
        groupCheckList[i] = true;
        matchRow = `${matchRow},,`;
      }
    }
    csvLines.push(matchRow);

    let test = true;
    groupCheckList.forEach(isDone => {
      test = test && isDone;
    });

    generatedAllMatches = test;
    matchIndex++;
  }
  csvLines.push('\n');

  let teamListLine = '';
  for(let i = 0; i < groups.length; i++) {
    teamListLine = `${teamListLine}Group ${i} Teams,Matches Played,,`;
  }
  csvLines.push(teamListLine);

  groupCheckList = [];
  let listedAllGroups = false;
  let teamIndex = 0;
  groups.forEach(() => {
    groupCheckList.push(false);
  });

  while(!listedAllGroups) {
    let groupRow = '';

    for (let i = 0; i < groups.length; i++) {
      if (teamIndex < groups[i].teams.length) {
        groupRow = `${groupRow}${groups[i].teams[teamIndex]},${groups[i][groups[i].teams[teamIndex]]},,`;
      } else {
        groupCheckList[i] = true;
        groupRow = `${groupRow},,,`
      }
    }
    csvLines.push(groupRow);

    let test = true;
    groupCheckList.forEach(isDone => {
      test = test && isDone;
    });

    listedAllGroups = test;
    teamIndex++;
  }

  let writeStream = fs.createWriteStream(outputFile);
  writeStream.once('open', () => {
    csvLines.forEach(line => {
      writeStream.write(line + '\n');
    });
    writeStream.end();
  });
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

  exportToCsv(groups);

  // console.log(JSON.stringify(groups, null, 2));
});
