import { useState, useEffect } from 'react';
import { GenerateButton } from './StyledComponents';

import { createClient } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

const supabase = createClient(
	process.env.REACT_APP_SUPABASE_URL,
	process.env.REACT_APP_SUPABASE_ANON_KEY
);

function SupabaseAuth() {
    const [session, setSession] = useState(null)

    useEffect(() => {
    	supabase.auth.getSession().then(({ data: { session } }) => { setSession(session) });

    	const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session)
		});

		return () => subscription.unsubscribe()
	}, [])

    if (!session) {
      	return (
			<div>
				<Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
			</div>
		)
    } else {
      	return (
			<div>
				<GenerateButton onClick={async () => {await supabase.auth.signOut();}}>
					Logout
				</GenerateButton>
			</div>
	  	)
	}
}

function AuthBlocks() {
    return (
		<SupabaseAuth />
    )
}

export default AuthBlocks;