import { Content, ContentProps } from "@reusable-ui/components";



export function Main(props: ContentProps) {
    return (
        <Content
            {...props}
            
            tag={props.tag ?? 'main'}
        />
    )
}