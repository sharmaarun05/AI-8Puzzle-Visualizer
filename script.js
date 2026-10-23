const grid = document.getElementById('puzzle-grid');
let currentState = [2,8,3,1,6,4,7,0,5];
const goalState = [1,2,3,8,0,4,7,6,5];

function renderGrid(state) {
    grid.innerHTML = '';
    state.forEach(val => {
        let div = document.createElement('div');
        div.className = 'tile ' + (val === 0 ? 'empty' : '');
        div.innerText = val === 0 ? '' : val;
        grid.appendChild(div);
    });
}

function generateRandom() {
    // Solvable permutation generator approximation
    currentState = [1,2,3,8,0,4,7,6,5].sort(() => Math.random() - 0.5);
    document.getElementById('initial-state').value = currentState.join(',');
    renderGrid(currentState);
    document.getElementById('status-msg').innerText = "Status: Random Puzzle Generated";
}

function getNeighbors(state) {
    let neighbors = [];
    let idx = state.indexOf(0);
    let row = Math.floor(idx / 3), col = idx % 3;
    let moves = [ {r: row-1, c: col}, {r: row+1, c: col}, {r: row, c: col-1}, {r: row, c: col+1} ];
    
    moves.forEach(m => {
        if(m.r >= 0 && m.r < 3 && m.c >= 0 && m.c < 3) {
            let newIdx = m.r * 3 + m.c;
            let newState = [...state];
            [newState[idx], newState[newIdx]] = [newState[newIdx], newState[idx]];
            neighbors.push(newState);
        }
    });
    return neighbors;
}

function startSearch() {
    document.getElementById('status-msg').innerText = "Status: Searching with BFS...";
    let startStr = document.getElementById('initial-state').value.split(',').map(Number);
    let t0 = performance.now();
    
    let queue = [{state: startStr, path: [], depth: 0}];
    let visited = new Set();
    visited.add(startStr.join(','));
    
    let nodesExpanded = 0;
    let nodesGenerated = 1;
    let goalStr = goalState.join(',');

    let searchInterval = setInterval(() => {
        if (queue.length === 0) {
            clearInterval(searchInterval);
            document.getElementById('status-msg').innerText = "Status: Failed. No Solution Found!";
            return;
        }

        let current = queue.shift();
        nodesExpanded++;
        
        // Update Stats UI real-time
        document.getElementById('nodes-gen').innerText = nodesGenerated;
        document.getElementById('nodes-exp').innerText = nodesExpanded;
        document.getElementById('frontier-size').innerText = queue.length;
        document.getElementById('explored-size').innerText = visited.size;
        document.getElementById('search-depth').innerText = current.depth;
        document.getElementById('mem-usage').innerText = ((visited.size * 32) / 1024).toFixed(2);

        renderGrid(current.state);

        if (current.state.join(',') === goalStr) {
            clearInterval(searchInterval);
            let t1 = performance.now();
            document.getElementById('status-msg').innerText = "Status: Goal Reached! Solution Found.";
            document.getElementById('total-moves').innerText = current.path.length;
            document.getElementById('exec-time').innerText = (t1 - t0).toFixed(2);
            return;
        }

        let neighbors = getNeighbors(current.state);
        neighbors.forEach(n => {
            let nStr = n.join(',');
            if (!visited.has(nStr)) {
                visited.add(nStr);
                nodesGenerated++;
                queue.push({state: n, path: [...current.path, n], depth: current.depth + 1});
            }
        });
    }, 20); // Fast interval to visualize exploration
}

function resetPuzzle() {
    currentState = [2,8,3,1,6,4,7,0,5];
    document.getElementById('initial-state').value = currentState.join(',');
    renderGrid(currentState);
    document.getElementById('status-msg').innerText = "Status: Ready";
    ['nodes-gen','nodes-exp','frontier-size','explored-size','total-moves','exec-time','search-depth','mem-usage'].forEach(id => {
        document.getElementById(id).innerText = "0";
    });
}

// Initialize board on load
renderGrid(currentState);
