import axios from 'axios'
import fs from 'fs/promises'
import path from 'path'

interface IMission {
    name: string
}

interface IShip {
    missions: IMission[],
    active: boolean,
    id: string,
    name: string
}

interface IExpectedResponse {
    data: {
        ships: IShip[]
    }
}

interface IExpectedCsvContent {
    name: string, missions: IMission[]
}

const filterActiveShips = (content: IExpectedResponse): IShip[] => {
    const { data } = content
    
    return data.ships.filter((ship: IShip) => ship.active)
}

const makeRequest = async () => {
    const headers = { 'Content-type': 'application/json' }
    const body = JSON.stringify({ 
        query: `
        {
            ships {
              missions {
                name
              }
              active
              id
              name
            }
        }
        `
     })


    return await axios.post('https://api.spacex.land/graphql', body, { headers })
}

const getCsvContent = (content: IShip[]): IExpectedCsvContent[] => {
    return content.map((ship: IShip) => ({
        name: ship.name,
        missions: ship.missions
    }));
}

const arrayToString = (array: IExpectedCsvContent['missions']) => {
    return array.map((element: IMission) => {
        return element.name
    })
}

const makeCsvContent = (content: IExpectedCsvContent[]) => {
    const result = content.map((element: IExpectedCsvContent) => {
        return `${element.name},"${arrayToString(element['missions'])}"`
    }).join('\n')

    return result
}

const createCsvFile = async (csvContent: string) => {
    const filePath = path.join(__dirname, 'content.csv')
    await fs.writeFile(filePath, csvContent)

    console.log(`Csv file created at ${filePath}`);
}

;(async () => {
    const { data } = await makeRequest()

    const activeShips: IShip[] = filterActiveShips(data)
    const expectedCsvContent: IExpectedCsvContent[] = getCsvContent(activeShips)
    const result = makeCsvContent(expectedCsvContent)

    createCsvFile(result)
    console.log('RESULT:\n' + result)
})()

// first part of csv == ship
// second part of csv == missions