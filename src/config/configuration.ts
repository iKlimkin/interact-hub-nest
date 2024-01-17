
export const getConfiguration = () => {
    return {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: Number(process.env.PORT) || 5555,
        CASE1: Number(process.env.CASE1) || 'case1...',
        CASE2: Number(process.env.CASE2) ?? 0,
        db: {
            mongo: {
                MONGO_URI: process.env.MONGO_URI ?? 'connection_to_db'
            }
        },
        // auth: getAuthConfiguration()
    }
    
}

type ConfigurationType = ReturnType<typeof getConfiguration>
export type ConfigType = ConfigurationType & {
    MONGO_URI: string,
    MONGO_URI2: string
    NODE_ENV: 'procudction' |'development' | 'stage'
} 