-- 今後作成するテーブル：
-- anon と authenticated への自動権限付与を停止
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL PRIVILEGES ON TABLES
  FROM anon, authenticated;

-- 今後作成するシーケンス：
-- anon と authenticated への自動権限付与を停止
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL PRIVILEGES ON SEQUENCES
  FROM anon, authenticated;

-- 今後作成する関数：
-- anon と authenticated への自動 EXECUTE 権限付与を停止
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS
  FROM anon, authenticated;

-- 今後作成する関数：
-- PUBLIC への自動 EXECUTE 権限付与も停止
ALTER DEFAULT PRIVILEGES FOR ROLE postgres
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;