import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, map } from "rxjs";

@Injectable()
export class WarpDataInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => {
                if(data.excludeInterCeptor){
                    return data.view
                }

                if (Array.isArray(data)) {
                    return { results: data.length, data };
                } else if (Array.isArray(data.documents)) {
                    const { documents, ...rest } = data;
                    return { ...rest, data: documents };
                } else {
                    if (data.token) {
                        const { token, ...rest } = data;
                        return {
                            data: { ...rest },
                            token,
                        };
                    } else {
                        return { data };
                    }
                }
            })
        );
    }
}
