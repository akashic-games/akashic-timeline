/**
 * Tweenに指定するオプション。
 */
export interface TweenOption {
	/**
	 * ループ実行するかどうかを指定する。
	 * `false`を指定した場合、全アクションが終了後、`Tween`は`Timeline`から削除される。
	 */
	loop?: boolean;

	/**
	 * 1フレーム処理が完了するごとに呼び出す関数を指定する。
	 * 省略された場合、Tweenの対象オブジェクトの`modified()`が与えられる(対象オブジェクトが`modified()`を持たない場合は`undefined`となる)。
	 * 呼び出された関数内での`this`はTweenの対象オブジェクトとなる。
	 */
	modified?: () => void;

	/**
	 * 対象が削除されたかどうかを調べる関数を指定する。
	 * 省略された場合、Tweenの対象オブジェクトの`destroyed()`が与えられる(対象オブジェクトが`destroyed()`を持たない場合は`undefined`となる)。
	 * この関数が`true`を返す場合、Tweenは自動的に処理を中止し、当該Tweenを抱えるTimelineもTweenも削除する。
	 * 呼び出された関数内での`this`はTweenの対象オブジェクトとなる。
	 */
	destroyed?: () => boolean;
}
