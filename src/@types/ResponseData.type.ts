export type TPaginateResults = {
    limit?:number
    currentPage?:number,
    totalResults?:number
    totalPages?:number
    next?:number | null,
    prev?:number | null
}