// lesson-kit の loop-protect.ts と同値の定数(constants.test.ts で同期を保証)。
// loop-protect.ts は acorn を import するため、判定バンドルに入る runtime からは
// 直接 import できない(SPEC B §2: バンドルに zod / acorn を入れない)。
export const LOOP_PROTECT_ERROR_MESSAGE = "__LOOP_LIMIT_EXCEEDED__";
export const LOOP_LIMIT_MESSAGE_JP = "無限ループになっていませんか? ループの回数が上限を超えました";
