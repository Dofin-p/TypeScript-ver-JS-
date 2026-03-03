import './style.css'

//呼び出すデータの型を定義
interface User{
    id:number;
    name:string;
}


// ソートの判定に使う文字列を2種類に限定
type SortType = 'name' | 'id';


// --- DOMの取得と型指定 ---
const button = document.getElementById("addBtn") as HTMLButtonElement;
const lists = document.getElementById("lists") as HTMLOListElement;
const waitmessage = document.getElementById("wait") as HTMLParagraphElement;
const sortNameBtn = document.getElementById("sortNameBtn") as HTMLButtonElement;
const sortIdBtn = document.getElementById("sortIdBtn") as HTMLButtonElement;

waitmessage.style.display = "none";

// テスト用遅延関数
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));


// --- データの取得 ---
async function getUsers(): Promise<User[]> {
    waitmessage.style.display = "block";
    waitmessage.innerText = "データを取得しています…";
    await sleep(2000); // テスト用

    try {
        const res = await fetch("https://jsonplaceholder.typicode.com/users");
        if (!res.ok) {
            throw new Error("ネットワークエラーが発生しました");
        }
        // 取得したJSONデータをUser配列の型として扱う
        const users = (await res.json()) as User[];
        return users;
    } catch (error) {
        console.error("データ取得失敗:", error);
        alert("データの取得に失敗しました。");
        return []; // エラー時、空の配列を返す
    } finally {
        // ローディング表示を消す
        waitmessage.style.display = "none";
    }
}

// --- データの表示 ---
function displayUsers(users: User[]): void {
    for (let index = 0; index < users.length; index++) {
        const user = users[index];
        const list = document.createElement("li");
        list.innerText = user.name;
        lists.appendChild(list);
    }
}

// --- sortロジック ---
// 引数 type を SortType に限定
function sortUsers(users: User[], type: SortType): User[] {
    const sorted = [...users].sort((a, b) => {
        if (type === 'name') {
            return a.name.localeCompare(b.name);
        } else if (type === 'id') {
            return a.id - b.id;
        }
        return 0; 
    });
    return sorted;
}


// --- 状態管理とイベント ---
let currentUsers: User[] = []; // 現在のユーザーデータを保持する変数

// データの取得と表示をまとめた関数 
async function loadAndDisplayUsers(): Promise<void> {
    const users = await getUsers();
    currentUsers = users; // 取得したユーザーデータを保存する
    lists.innerHTML = ""; // リストを空にする

    displayUsers(users);
}

// イベントの設定
window.addEventListener("load", loadAndDisplayUsers);
button.addEventListener("click", loadAndDisplayUsers);

sortNameBtn.addEventListener("click", () => {
    currentUsers = sortUsers(currentUsers, 'name');
    lists.innerHTML = "";
    displayUsers(currentUsers);
});

sortIdBtn.addEventListener("click", () => {
    currentUsers = sortUsers(currentUsers, 'id');
    lists.innerHTML = "";
    displayUsers(currentUsers);
});