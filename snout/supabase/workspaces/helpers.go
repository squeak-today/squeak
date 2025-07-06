package workspaces

import (
	"snout/supabase"
)

func CheckWorkspaceUserOwnership(client *supabase.Client, userId string, workspaceId string) (bool, error) {
	var exists bool
	err := client.Db.QueryRow(`
		SELECT EXISTS (
			SELECT 1 FROM workspaces WHERE id = $1 AND user_id = $2
		)
	`, workspaceId, userId).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}