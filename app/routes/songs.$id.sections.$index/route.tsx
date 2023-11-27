import { json, type ActionFunctionArgs, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { useParams, useFetcher, useLoaderData, useOutletContext } from "@remix-run/react";
import { useRef, useEffect } from "react";
import { prefs } from "~/cookies.server";
import { Supabase } from "~/database/supabase.server";
// import CreatableSelect from 'react-select/creatable';
// import type { StylesConfig } from "react-select";
import Modal from "~/components/modal/Modal";
import styles from "./styles.module.css";
import type { OutletContext } from "~/types";


const SECTION_TYPES = [
  { label: 'Intro', value: 'Intro' },
  { label: 'Verse', value: 'Verse' },
  { label: 'Pre-chorus', value: 'Pre-chorus' },
  { label: 'Chorus', value: 'Chorus' },
  { label: 'Post-chorus', value: 'Post-chorus' },
  { label: 'Bridge', value: 'Bridge' },
  { label: 'Outro', value: 'Outro' }
]

// const customStyles: StylesConfig = {
//   input: (provided, state) => ({
//     ...provided,
//     width: '100%',
//     height: 32,
//     display: 'flex',
//     alignItems: 'center',
//   }),
//   singleValue: (provided, state) => ({
//     ...provided,
//     marginTop: 2,
//   }),
// };


export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  // if (!params.id) throw new Response("Song Id Not Supplied", { status: 400 });
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await prefs.parse(cookieHeader)) || {};

  const { supabase, headers } = Supabase(request)

  const { data, error } = await supabase.rpc('song_section_get', {
    index: params.index,
    song_id: params.id
  })

  if (error) return json({ section: null, error: error }, { status: 500, headers })
  // if (!data) throw new Response("Not Found", { status: 404 });

  return json({ section: data, collapsedSections: cookie.collapsedSections as string[] }, { headers });
};


export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { supabase, headers } = Supabase(request)
  const form = await request.formData();

  const index = params.index
  const songId = params.id

  const type = form.has('type') ? form.get('type') as string : undefined
  const content = form.has('content') ? form.get('content') as string : undefined
  const linked = form.has('linked') ? form.getAll('linked').includes('1') : undefined

  const section = { type: type, content: content, linked: linked }

  if (request.method === 'POST') {
    const { error } = await supabase.rpc('song_section_add', {
      section: section,
      index: index,
      song_id: songId
    })
    
    if (error) return json(error, { status: 500, headers })
    return new Response(null, { status: 201, headers })
  }

  if (request.method === 'PATCH') {
    const { data, error } = await supabase.rpc('song_section_edit', {
      section: section,
      index: index,
      song_id: songId
    })

    console.log(data, error)
    
    if (error) return json(error, { status: 500, headers })
    return new Response(null, { status: 204, headers })
  }

  if (request.method === 'DELETE') {
    const { data, error } = await supabase.rpc('song_section_remove', {
      index: index,
      song_id: songId
    })
    
    if (error) return json(error, { status: 500, headers })
    return redirect(`/songs/${params.id}`, { headers })
  }


  return new Response(null, { status: 405, headers })
};



export default function Section () {
  const params = useParams()
  const fetcher = useFetcher();
  const settingsModal = useRef<HTMLDialogElement>(null)

  const { section } = useLoaderData<typeof loader>();
  const { song, session } = useOutletContext<OutletContext>();

  
  useEffect(() => {
    if (!settingsModal.current) return
    settingsModal.current.showModal()
  }, [ settingsModal ])
  
  if (!section) return 'DONT EXIST BRUH'

  const collaboratorRole = song.collaborators?.find(c => c.user_info?.id === session.user.id)?.role
  const canEdit = collaboratorRole !== 'viewer'
  
  
  const foundSectionType = SECTION_TYPES.find(t => t.value === section.type)
  const sectionTypes = [ ...SECTION_TYPES, foundSectionType ]
    
  return (
    <Modal
      titleProps={{
        name: "type",
        placeholder: "Section Type",
        value: section.type,
        action: `/songs/${params.id}/sections/${params.index}`,
        disabled: !canEdit
      }}
      subtitle="section settings"
      closeAction="../.."
      deleteAction={canEdit ? `/songs/${params.id}/sections/${params.index}` : undefined}
      className={styles.layout}
    >
      <fetcher.Form
        method="patch"
        onChange={(event) => fetcher.submit(event.currentTarget, { method: 'PATCH' })}
        className={styles.form}
      >
        <datalist id="types">
          <option value="Intro" />
          <option value="Verse" />
          <option value="Pre-chorus" />
          <option value="Chorus" />
          <option value="Post-chorus" />
          <option value="Bridge" />
          <option value="Outro" />
        </datalist>
        {/* <CreatableSelect
          name="type"
          options={SECTION_TYPES}
          defaultInputValue={section.type}
          defaultValue={ sectionTypes[sectionTypes.length - 1] }
          styles={customStyles}
        /> */}

        <label className={styles.label} htmlFor="linked">Linked</label>
        <input name="linked" value={0} type="hidden" />
        <input className={styles.input} name="linked" value={1} type="checkbox" defaultChecked={section.linked} disabled={!canEdit} />
      </fetcher.Form>
    </Modal>
  );
}