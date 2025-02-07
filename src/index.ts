import "./style.scss"

type CompareFunction = (a: any, b: any) => number

/**
 * Compare functions to sort.
 */
const compareFunctions: { [key: string]: CompareFunction } = {
  number: (a: number, b: number) => {
    return a - b
  },
  Date: (a: Date, b: Date) => {
    return a.getTime() - b.getTime()
  },
}

/**
 * Convert style string into object.
 * @param str A string to be parsed
 * @returns An object that has properties expressed by `str`, or an empty object if `str` is null
 */
const parseStyleString = (str: string | null) => {
  const obj: { [key: string]: string } = {}

  if (str === null) {
    return obj
  }

  const pairs = str.split(';')
  for (const pair of pairs) {
    const [key, value] = pair.split(':')
    obj[key.trim()] = value.trim()
  }

  return obj
}

/**
 * Get a value from `obj` with `keys`.
 * @param obj An object should have the value
 * @param keys Key list to express where the key in
 * @returns The value
 */
const getValueIn = (obj: any, keys: string[]) => {
  let value = obj

  for (const key of keys) {
    if (key in value) {
      value = value[key]
    }
    else {
      console.warn(`\`${key}\` is not in`, value)
      return null
    }
  }

  return value
}

// Entry point
const sortables = document.querySelectorAll('.sortable')
for (const sortable of sortables) {
  const headers = sortable.querySelectorAll('[sort-key]')
  if (headers.length === 0) {
    console.warn('Add the attribute `sort-key` to one or more headers to sort contents.')
    continue
  }

  const body = sortable.querySelector('.sortable-body')
  if (body === null) {
    console.warn('Add the class `sortable-body` to an element with contents to sort contents.')
    continue
  }

  let lastClickedElement: Element

  // Add sort logic
  for (const header of headers) {
    header.classList.add('unselectable')
    
    const keys = header.getAttribute('sort-key')?.split('/') ?? []

    const locale = header.getAttribute('sort-locale')?.split(',') ?? undefined
    const optionsStr = header.getAttribute('sort-options')
    const options = parseStyleString(optionsStr) ?? undefined

    let compareFunction: CompareFunction

    const type = header.getAttribute('sort-type')
    if (type !== null && type in compareFunctions) {
      const subCompareFunction = compareFunctions[type]
      compareFunction = (a, b) => {
        const aVal = getValueIn(a, keys)
        const bVal = getValueIn(b, keys)
        if (aVal === null) {
          return 1
        }
        else if (bVal === null) {
          return -1
        }
        return subCompareFunction(aVal, bVal)
      }
    }
    else {
      compareFunction = (a, b) => {
        const aStr = getValueIn(a, keys)?.toString()
        const bStr = getValueIn(b, keys)?.toString()
        if (aStr === null) {
          return 1
        }
        else if (bStr === null) {
          return -1
        }
        return aStr.localeCompare(bStr, locale, options)
      }
    }

    header.addEventListener('click', () => {
      const children = Array.from(body.children)

      if (lastClickedElement === header) {
        children.reverse()

        header.classList.toggle('in-descending-order')
        header.classList.toggle('in-ascending-order')
      }
      else {
        lastClickedElement?.classList.remove('in-ascending-order')
        lastClickedElement?.classList.remove('in-descending-order')

        lastClickedElement = header
        children.sort(compareFunction)

        header.classList.add('in-ascending-order')
        header.classList.remove('in-descending-order')
      }

      for (const child of children) {
        body.appendChild(child)
      }
    })
  }
}