import { GithubUser } from "./GithubUser.js"

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
    this.noScreenUsers()
    this.screenUsers()
  }

  noScreenUsers() {
    if(localStorage.getItem("@github-favorites:") == "[]") {
      this.root.querySelector('.users').classList.add('hide')
      this.root.querySelector('.screen-no-users').classList.remove('hide')
    } 
   }
  
   screenUsers() {
    if(localStorage.getItem("@github-favorites:") !== "[]") {
      this.root.querySelector('.users').classList.remove('hide')
      this.root.querySelector('.screen-no-users').classList.add('hide')
    }
   }


  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }
    
  async add(username) {
    try {

      const userExists = this.entries.find(entry => entry.login === username)
      
      if(userExists) {
        throw new Error('Usuário já cadastrado')
      }

      const user = await GithubUser.search(username)

      if(user.login === undefined) {
        throw new Error('Usuário não encontrado!')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()
      this.noScreenUsers()
      this.screenUsers()

    } catch(error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(entry => entry.login !== user.login)

    this.entries = filteredEntries
    this.update()
    this.save()
    this.noScreenUsers()
    this.screenUsers()
  }

}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector('.search button')

    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input')

      this.add(value)
    }
  }

  
  update() {
    this.removeAllTr()
    


    this.entries.forEach( user => {
      const row = this.createRow()

      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user p').innerText = user.name
      row.querySelector('.user span').innerText = "/" + user.login
      row.querySelector('.repositories').innerText = user.public_repos
      row.querySelector('.followers').innerText = user.followers
      row.querySelector('.user a').href = `https://github.com/${user.login}`

      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar essa linha?')

        if(isOk) {
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = `
                <td class="user">
                  <img src="https://github.com/iranfilhof.png" alt="Imagem de iranfilhof">
                  <a href="https://github.com/iranfilhof" target="_blank">
                    <p>Iran Filho</p>
                    <span>/iranfilhof</span>
                  </a>
                </td>
                <td class="repositories">23</td>
                <td class="followers">63</td>
                <td><button class="remove">Remover</button></td>
    `
    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach((tr) => {
      tr.remove()
    })
  }
}