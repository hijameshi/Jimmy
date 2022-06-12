#include<iostream>
#include<queue>

using namespace std;

int N = 6;
int R = 8;

int star[6][2] = {
	{15,12},
	{1,2},
	{22,5},
	{33,21},
	{21,21},
	{54,2}
};

int dx[4] = { 1,0,-1,0 };
int dy[4] = { 0,-1,0,1 };

int sky[101][101];
int visit[101][101];

int num_galaxy = 0;
int star_count = 0;

template <typename T1, typename T2, typename T3>
void re_sky(T1 N, T2 star, T3* sky) {
	for (int i = 0; i < N; i++) {
		int x = star[i][0];
		int y = star[i][1];
		sky[x][y] = 1;
	}
}

template <typename T1, typename T2, typename T3, typename T4>
void sumit_R(T1 N, T2 R, T3 star, T4* sky) {
	for (int i = 0; i < N; i++) {
		int x = star[i][0];
		int y = star[i][1];

		for (int j = R * -1; j < R; j++) {
			for (int k = R * -1; k < R; k++) {
				int nx = x + j;
				int ny = y + k;

				int D = (nx - x) * (nx - x) + (ny - y) * (ny - y);

				if (nx >= 0 && ny >= 0 && nx < 100 && ny < 100) {
					if (D <= R * R) {
						sky[nx][ny] = 1;
					}
				}
			}
		}
	}
}

void bfs(int x, int y) {
	star_count = 0;
	if (sky[x][y] == 1) {
		sky[x][y] = 0;
		star_count++;
	}
	queue<pair<int, int>>q;
	q.push(make_pair(x, y));



	while (!q.empty()) {
		int x = q.front().first;
		int y = q.front().second;
		q.pop();

		for (int i = 0; i < 4; i++) {
			int nx = x + dx[i];
			int ny = y + dy[i];
			if (nx >=0 && ny >= 0 && nx < 100 && ny < 100) {
				if (sky[nx][ny] == 1) {
					//visit[nx][ny] = 1;
					sky[nx][ny] = 0;
					star_count++;
					q.push(make_pair(nx, ny));
				}
			}
		}
	}
	if (star_count > 0) num_galaxy++;
}



int main() {
	re_sky(N, star, sky);
	sumit_R(N, R, star, sky);
	//bfs(0, 0);


	for (int i = 0; i < 100; i++) {
		for (int j = 0; j < 100; j++) {
			cout << sky[i][j];
		}
		cout << endl;
	}

	for (int i = 0; i < 100; i++) {
		for (int j = 0; j < 100; j++) {
			bfs(i, j);
		}
	}
	cout << num_galaxy;
}
