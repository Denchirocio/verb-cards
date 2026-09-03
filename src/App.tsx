import { Routes, Route } from 'react-router'
import Layout from './components/Layout'
import Menu from './pages/Menu'
import GroupForms from './pages/GroupForms'
import Practice from './pages/Practice'
import VerbList from './pages/VerbList'
import VerbDetail from './pages/VerbDetail'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Menu />} />
        <Route path="/grupo/:groupId" element={<GroupForms />} />
        <Route path="/practicar/:form" element={<Practice />} />
        <Route path="/lista" element={<VerbList />} />
        <Route path="/verbo/:kanji" element={<VerbDetail />} />
      </Route>
    </Routes>
  )
}
