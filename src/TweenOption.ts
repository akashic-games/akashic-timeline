/**
 * Tweenに指定するオプション。
 */
interface TweenOption {
	/**
	 * ループ実行するかどうかを指定する。
	 * `false`を指定した場合、全アクションが終了後、`Tween`は`Timeline`から削除される。
	 */
	loop?: boolean;

	/**
	 * 1フレーム処理が完了するごとに呼び出す関数を指定する。
	 * 例としてTweenの対象オブジェクトが`E`の場合は`E#modified()`を指定することになる。
	 * 呼び出された関数内での`this`はTweenの対象オブジェクトとなる。
	 */
	modified?: () => void;

	/**
	 * 対象が削除されたかどうかを調べる関数を指定する。
	 * 例としてTweenの対象オブジェクトが`E`の場合は`E#destroyed()`を指定することになる。
	 * この関数が`true`を返す場合、Tweenは自動的に処理を中止し、当該Tweenを抱えるTimelineもTweenも削除する。
	 * 呼び出された関数内での`this`はTweenの対象オブジェクトとなる。
	 */
	destroyed?: () => boolean;
}

export = TweenOption;
